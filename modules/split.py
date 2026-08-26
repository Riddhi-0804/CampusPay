from decimal import Decimal, ROUND_HALF_UP


def calculate_equal_split(total_amount, member_count):
    if member_count <= 0:
        raise ValueError("Member count must be greater than zero")

    total_amount = Decimal(str(total_amount))
    share = (total_amount / member_count).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )

    shares = [share] * member_count
    difference = total_amount - sum(shares)

    if difference != Decimal("0.00"):
        shares[-1] += difference

    return shares


def calculate_unequal_split(amounts):
    if not amounts:
        raise ValueError("At least one amount is required")

    shares = [Decimal(str(amount)) for amount in amounts]

    if any(amount < 0 for amount in shares):
        raise ValueError("Amounts cannot be negative")

    return [
        amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        for amount in shares
    ]


def calculate_percentage_split(total_amount, percentages):
    if not percentages:
        raise ValueError("At least one percentage is required")

    total_amount = Decimal(str(total_amount))
    percentages = [Decimal(str(value)) for value in percentages]

    if any(value < 0 for value in percentages):
        raise ValueError("Percentages cannot be negative")

    if sum(percentages) != Decimal("100"):
        raise ValueError("Percentages must add up to 100")

    shares = [
        (total_amount * percentage / Decimal("100")).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )
        for percentage in percentages
    ]

    difference = total_amount - sum(shares)

    if difference != Decimal("0.00"):
        shares[-1] += difference

    return shares


def calculate_item_based_split(items):
    if not items:
        raise ValueError("At least one item is required")

    member_totals = {}

    for item in items:
        member_id = item.get("member_id")
        price = item.get("price")

        if member_id is None or price is None:
            raise ValueError("Each item must have member_id and price")

        price = Decimal(str(price))

        if price < 0:
            raise ValueError("Item prices cannot be negative")

        member_totals[member_id] = (
            member_totals.get(member_id, Decimal("0.00")) + price
        )

    return {
        member_id: amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )
        for member_id, amount in member_totals.items()
    }


def process_receipt_data(receipt_data):
    if not isinstance(receipt_data, dict):
        raise ValueError("Receipt data must be a dictionary")

    required_fields = [
        "merchant_name",
        "expense_date",
        "items",
        "tax",
        "total_amount"
    ]

    for field in required_fields:
        if field not in receipt_data:
            raise ValueError(f"Missing receipt field: {field}")

    if not isinstance(receipt_data["items"], list):
        raise ValueError("Receipt items must be a list")

    return {
        "merchant_name": receipt_data["merchant_name"],
        "expense_date": receipt_data["expense_date"],
        "items": receipt_data["items"],
        "tax": Decimal(str(receipt_data["tax"])),
        "total_amount": Decimal(str(receipt_data["total_amount"]))
    }