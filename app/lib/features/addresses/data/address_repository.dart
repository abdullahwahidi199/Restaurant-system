import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/api/api_client.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/api/api_error_mapper.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';

final addressRepositoryProvider = Provider<AddressRepository>((ref) {
  return DioAddressRepository(ref.watch(dioProvider));
});

abstract interface class AddressRepository {
  Future<List<CustomerAddress>> getAddresses();
  Future<CustomerAddress> createAddress(CustomerAddressDraft draft);
  Future<CustomerAddress> updateAddress(int id, CustomerAddressDraft draft);
  Future<void> deleteAddress(int id);
  Future<CustomerAddress> setDefault(int id);
}

class DioAddressRepository implements AddressRepository {
  DioAddressRepository(this._dio);

  final Dio _dio;

  @override
  Future<List<CustomerAddress>> getAddresses() async {
    try {
      final response = await _dio.get<Object?>(ApiEndpoints.customerAddresses);
      return jsonMapList(response.data).map(CustomerAddress.fromJson).toList();
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load your addresses.',
      );
    }
  }

  @override
  Future<CustomerAddress> createAddress(CustomerAddressDraft draft) async {
    try {
      final response = await _dio.post<Object?>(
        ApiEndpoints.customerAddresses,
        data: draft.toJson(),
      );
      return CustomerAddress.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to save this address.',
      );
    }
  }

  @override
  Future<CustomerAddress> updateAddress(
    int id,
    CustomerAddressDraft draft,
  ) async {
    try {
      final response = await _dio.patch<Object?>(
        ApiEndpoints.customerAddress(id),
        data: draft.toJson(),
      );
      return CustomerAddress.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to update this address.',
      );
    }
  }

  @override
  Future<void> deleteAddress(int id) async {
    try {
      await _dio.delete<Object?>(ApiEndpoints.customerAddress(id));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to delete this address.',
      );
    }
  }

  @override
  Future<CustomerAddress> setDefault(int id) async {
    try {
      final response = await _dio.patch<Object?>(
        ApiEndpoints.customerAddress(id),
        data: const {'is_default': true},
      );
      return CustomerAddress.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to select this address.',
      );
    }
  }
}
