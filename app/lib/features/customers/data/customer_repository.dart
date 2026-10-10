import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/api/api_client.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/api/api_error_mapper.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/customers/domain/customer_models.dart';

final customerRepositoryProvider = Provider<CustomerRepository>((ref) {
  return DioCustomerRepository(ref.watch(dioProvider));
});

abstract interface class CustomerRepository {
  Future<CustomerProfile> getProfile();
}

class DioCustomerRepository implements CustomerRepository {
  DioCustomerRepository(this._dio);

  final Dio _dio;

  @override
  Future<CustomerProfile> getProfile() async {
    try {
      final response = await _dio.get<Object?>(ApiEndpoints.customerProfile);
      return CustomerProfile.fromJson(jsonMap(response.data));
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load your profile.',
      );
    }
  }
}
