import 'dart:convert';
import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/api/api_client.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/api/api_error_mapper.dart';
import 'package:pakhlai_mobile/core/config/app_config.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return DioOrderRepository(ref.watch(dioProvider));
});

abstract interface class OrderRepository {
  Future<CustomerOrderPage> getOrders({int page = 1});
  Future<CustomerOrder> getOrder(int id);
  Future<CheckoutQuote> validateCheckout(CheckoutRequest request);
  Future<CustomerOrder> createOrder(CheckoutRequest request);
  Future<CustomerOrder> retryOrder(Map<String, dynamic> request);
  Future<CustomerOrder> cancelOrder(int id);
  Stream<OrderLiveEvent> watchOrder(int id);
}

enum OrderLiveEvent { connected, updated }

class DioOrderRepository implements OrderRepository {
  DioOrderRepository(this._dio);

  final Dio _dio;

  @override
  Future<CustomerOrderPage> getOrders({int page = 1}) async {
    try {
      final response = await _dio.get<Object?>(
        ApiEndpoints.customerOrders,
        queryParameters: {'page': page},
      );
      final data = jsonMap(response.data);
      return CustomerOrderPage(
        items: jsonMapList(
          response.data is List ? response.data : data['results'],
        ).map(CustomerOrder.fromJson).toList(),
        hasNext: data['next'] != null,
      );
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load your orders.',
      );
    }
  }

  @override
  Future<CustomerOrder> getOrder(int id) async {
    try {
      final response = await _dio.get<Object?>(ApiEndpoints.customerOrder(id));
      return CustomerOrder.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load this order.',
      );
    }
  }

  @override
  Future<CheckoutQuote> validateCheckout(CheckoutRequest request) async {
    try {
      final response = await _dio.post<Object?>(
        ApiEndpoints.checkoutValidation,
        data: request.toJson(),
      );
      return CheckoutQuote.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to validate your cart.',
      );
    }
  }

  @override
  Future<CustomerOrder> createOrder(CheckoutRequest request) async {
    return retryOrder(request.toJson());
  }

  @override
  Future<CustomerOrder> retryOrder(Map<String, dynamic> request) async {
    try {
      final response = await _dio.post<Object?>(
        ApiEndpoints.customerOrders,
        data: request,
      );
      return CustomerOrder.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to place your order.',
      );
    }
  }

  @override
  Future<CustomerOrder> cancelOrder(int id) async {
    try {
      final response = await _dio.post<Object?>(
        ApiEndpoints.cancelCustomerOrder(id),
      );
      return CustomerOrder.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to cancel this order.',
      );
    }
  }

  @override
  Stream<OrderLiveEvent> watchOrder(int id) {
    WebSocketChannel? channel;
    StreamSubscription<dynamic>? subscription;
    var cancelled = false;
    late final StreamController<OrderLiveEvent> controller;
    Future<void> connect() async {
      try {
        final response = await _dio.post<Object?>(
          ApiEndpoints.customerOrderSocketTicket(id),
        );
        if (cancelled) return;
        final ticket = jsonString(jsonMap(response.data)['ticket']);
        if (ticket == null) {
          throw const AppException('Live updates are unavailable.');
        }
        final socketUri = Uri.parse(AppConfig.webSocketBaseUrl)
            .resolve('customer/orders/$id/')
            .replace(queryParameters: {'ticket': ticket});
        channel = WebSocketChannel.connect(socketUri);
        await channel!.ready.timeout(const Duration(seconds: 10));
        if (cancelled) {
          await channel!.sink.close();
          return;
        }
        subscription = channel!.stream.listen(
          (event) {
            try {
              final message = jsonMap(
                event is String ? jsonDecode(event) : null,
              );
              if (message['type'] == 'CONNECTED') {
                controller.add(OrderLiveEvent.connected);
              }
              if (message['type'] == 'ORDER_UPDATED') {
                controller.add(OrderLiveEvent.updated);
              }
            } on FormatException {
              /* Ignore malformed events; polling stays authoritative. */
            }
          },
          onError: (Object error) {
            if (!cancelled) controller.addError(error);
          },
          onDone: () {
            if (!cancelled) controller.close();
          },
        );
      } on DioException catch (error) {
        if (!cancelled) {
          controller.addError(
            ApiErrorMapper.fromDio(
              error,
              fallback: 'Live updates are unavailable.',
            ),
          );
        }
        if (!cancelled) await controller.close();
      } catch (error) {
        if (!cancelled) controller.addError(error);
        if (!cancelled) await controller.close();
        await channel?.sink.close();
      }
    }

    controller = StreamController<OrderLiveEvent>(
      onListen: connect,
      onCancel: () async {
        cancelled = true;
        await subscription?.cancel();
        await channel?.sink.close();
      },
    );
    return controller.stream;
  }
}
