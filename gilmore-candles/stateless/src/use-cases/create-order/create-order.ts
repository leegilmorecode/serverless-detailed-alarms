import { getISOString, logger, schemaValidator } from '@shared/index';

import { CreateOrderDto } from '@dto/create-order';
import { OrderDto } from '@dto/order';
import { OverAgreedLimitError } from '@errors/over-agreed-limit-error';
import { createOrder } from '@adapters/secondary/database-adapter';
import { schema } from '@schemas/order';
import { v4 as uuid } from 'uuid';

// primary adapter --> (use case) --> secondary adapter(s)
export async function createOrderUseCase(
  createOrderDto: CreateOrderDto
): Promise<OrderDto> {
  const createdDate = getISOString();

  const newOrderDto: OrderDto = {
    id: uuid(),
    created: createdDate,
    ...createOrderDto,
  };

  // this is our check that the price * quantity is not over our
  // made up thresholds for this article - static @ 100.00

  if (newOrderDto.price * newOrderDto.quantity > 100.0)
    throw new OverAgreedLimitError('over agreed threshold');

  schemaValidator(schema, newOrderDto);

  const createdOrder = await createOrder(newOrderDto);

  logger.info(`order saved`);

  return createdOrder;
}
