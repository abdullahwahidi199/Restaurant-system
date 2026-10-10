import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';

enum CustomerOrderType { delivery, takeaway }

enum OrderPhase {
  received,
  confirmed,
  preparing,
  ready,
  outForDelivery,
  finished,
  cancelled,
  unknown,
}

OrderPhase orderPhase(String status) => switch (status.toLowerCase()) {
  'pending' => OrderPhase.received,
  'approved' => OrderPhase.confirmed,
  'in_progress' || 'preparing' => OrderPhase.preparing,
  'ready' => OrderPhase.ready,
  'out_for_delivery' => OrderPhase.outForDelivery,
  'delivered' || 'completed' || 'picked_up' || 'served' => OrderPhase.finished,
  'cancelled' || 'canceled' => OrderPhase.cancelled,
  _ => OrderPhase.unknown,
};

class CustomerOrderPage {
  const CustomerOrderPage({required this.items, required this.hasNext});
  final List<CustomerOrder> items;
  final bool hasNext;
}

extension CustomerOrderTypeValue on CustomerOrderType {
  String get apiValue => name;
}

class CustomerOrderItem {
  const CustomerOrderItem({
    required this.id,
    required this.itemId,
    required this.type,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
    required this.status,
    this.note,
  });

  final int id;
  final int itemId;
  final MarketplaceItemType type;
  final String name;
  final int quantity;
  final double unitPrice;
  final double subtotal;
  final String status;
  final String? note;

  factory CustomerOrderItem.fromJson(Map<String, dynamic> json) {
    return CustomerOrderItem(
      id: jsonInt(json['id']) ?? 0,
      itemId: jsonInt(json['item_id']) ?? 0,
      type: json['type'] == 'platter'
          ? MarketplaceItemType.platter
          : MarketplaceItemType.menuItem,
      name: jsonString(json['name']) ?? jsonString(json['menu_item']) ?? 'Item',
      quantity: jsonInt(json['quantity']) ?? 0,
      unitPrice: jsonDouble(json['unit_price']) ?? 0,
      subtotal: jsonDouble(json['subtotal']) ?? 0,
      status: jsonString(json['status']) ?? '',
      note: jsonString(json['note']),
    );
  }
}

class CustomerOrder {
  const CustomerOrder({
    required this.id,
    required this.orderNumber,
    required this.orderType,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.total,
    required this.items,
    required this.isFinal,
    this.restaurantName,
    this.restaurantSlug,
    this.branchName,
    this.branchSlug,
    this.address,
    this.phone,
    this.note,
    this.paymentMethod,
    this.preparationTime,
    this.createdAt,
    this.updatedAt,
    this.paidAt,
  });

  final int id;
  final int orderNumber;
  final CustomerOrderType orderType;
  final String status;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double total;
  final String? restaurantName;
  final String? restaurantSlug;
  final String? branchName;
  final String? branchSlug;
  final String? address;
  final String? phone;
  final String? note;
  final String? paymentMethod;
  final int? preparationTime;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? paidAt;
  final bool isFinal;
  final List<CustomerOrderItem> items;

  bool get isActive => !isFinal;
  OrderPhase get phase => orderPhase(status);

  factory CustomerOrder.fromJson(Map<String, dynamic> json) {
    final status = jsonString(json['status']) ?? '';
    return CustomerOrder(
      id: jsonInt(json['id']) ?? 0,
      orderNumber: jsonInt(json['order_number']) ?? jsonInt(json['id']) ?? 0,
      orderType: json['order_type'] == 'delivery'
          ? CustomerOrderType.delivery
          : CustomerOrderType.takeaway,
      status: status,
      subtotal: jsonDouble(json['subtotal']) ?? 0,
      deliveryFee: jsonDouble(json['delivery_fee']) ?? 0,
      discount: jsonDouble(json['discount']) ?? 0,
      total: jsonDouble(json['total']) ?? 0,
      restaurantName: jsonString(json['restaurant']),
      restaurantSlug: jsonString(json['restaurant_slug']),
      branchName: jsonString(json['branch']),
      branchSlug: jsonString(json['branch_slug']),
      address: jsonString(json['address']),
      phone: jsonString(json['phone']),
      note: jsonString(json['note']),
      paymentMethod: jsonString(json['payment_method']),
      preparationTime: jsonInt(json['preparation_time']),
      createdAt: DateTime.tryParse(jsonString(json['created_at']) ?? ''),
      updatedAt: DateTime.tryParse(jsonString(json['updated_at']) ?? ''),
      paidAt: DateTime.tryParse(jsonString(json['paid_at']) ?? ''),
      isFinal:
          jsonBool(json['is_final']) ??
          const {'completed', 'delivered', 'cancelled'}.contains(status),
      items: jsonMapList(json['items'])
          .map(CustomerOrderItem.fromJson)
          .toList(),
    );
  }
}

class CheckoutLineQuote {
  const CheckoutLineQuote({
    required this.itemId,
    required this.itemType,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
  });

  final int itemId;
  final MarketplaceItemType itemType;
  final String name;
  final int quantity;
  final double unitPrice;
  final double subtotal;

  String get cartKey => '${itemType.name}:$itemId';

  factory CheckoutLineQuote.fromJson(Map<String, dynamic> json) {
    return CheckoutLineQuote(
      itemId: jsonInt(json['item_id']) ?? 0,
      itemType: json['item_type'] == 'platter'
          ? MarketplaceItemType.platter
          : MarketplaceItemType.menuItem,
      name: jsonString(json['name']) ?? '',
      quantity: jsonInt(json['quantity']) ?? 0,
      unitPrice: jsonDouble(json['unit_price']) ?? 0,
      subtotal: jsonDouble(json['subtotal']) ?? 0,
    );
  }
}

class CheckoutQuote {
  const CheckoutQuote({
    required this.orderType,
    required this.paymentMethod,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.total,
    required this.items,
    required this.quoteToken,
  });

  final CustomerOrderType orderType;
  final String paymentMethod;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double total;
  final List<CheckoutLineQuote> items;
  final String quoteToken;

  factory CheckoutQuote.fromJson(Map<String, dynamic> json) {
    return CheckoutQuote(
      orderType: json['order_type'] == 'delivery'
          ? CustomerOrderType.delivery
          : CustomerOrderType.takeaway,
      paymentMethod: jsonString(json['payment_method']) ?? '',
      subtotal: jsonDouble(json['subtotal']) ?? 0,
      deliveryFee: jsonDouble(json['delivery_fee']) ?? 0,
      discount: jsonDouble(json['discount']) ?? 0,
      total: jsonDouble(json['total']) ?? 0,
      items: jsonMapList(json['items'])
          .map(CheckoutLineQuote.fromJson)
          .toList(),
      quoteToken: jsonString(json['quote_token']) ?? '',
    );
  }
}

class CheckoutRequest {
  const CheckoutRequest({
    required this.cart,
    required this.orderType,
    required this.contactPhone,
    this.addressId,
    this.deliveryInstructions = '',
    this.idempotencyKey,
    this.quoteToken,
  });

  final Cart cart;
  final CustomerOrderType orderType;
  final int? addressId;
  final String contactPhone;
  final String deliveryInstructions;
  final String? idempotencyKey;
  final String? quoteToken;

  Map<String, Object?> toJson() => {
    'restaurant_slug': cart.restaurantSlug,
    'branch_slug': cart.branchSlug,
    'order_type': orderType.apiValue,
    'address_id': orderType == CustomerOrderType.delivery ? addressId : null,
    'contact_phone': contactPhone.trim(),
    'note': cart.orderNote ?? '',
    'delivery_instructions': deliveryInstructions.trim(),
    if (idempotencyKey != null) 'idempotency_key': idempotencyKey,
    if (quoteToken != null) 'quote_token': quoteToken,
    'items': [
      for (final item in cart.items)
        {
          'item_type': item.itemType == MarketplaceItemType.platter
              ? 'platter'
              : 'menu_item',
          'item_id': item.itemId,
          'quantity': item.quantity,
          'note': item.note ?? '',
        },
    ],
  };
}
