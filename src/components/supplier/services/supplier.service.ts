import { Supplier } from '../models/supplier.model';

const BASE_URL = 'https://my-go-backend.onrender.com';

export async function createSupplier(supplier: Supplier): Promise<Response> {
  return fetch(`${BASE_URL}/CreateSupplier`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplier),
  });
}
