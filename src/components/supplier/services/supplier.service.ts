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

// Assign product to supplier
export async function assignProductToSupplier(
  supplierId: string,
  productId: string
): Promise<Response> {
  const url = `${BASE_URL}/AssignProductToSupplier?supplierId=${supplierId}&productId=${productId}`;
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Find products by supplier ID
export async function findProductsBySupplierID(supplierId: string): Promise<any[]> {
  try {
    const url = `${BASE_URL}/FindProductsBySupplierID?supplierId=${supplierId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch supplier products');
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    return [];
  }
}

// Delete supplier by ID
export async function deleteSupplierById(supplierId: string): Promise<Response> {
  const url = `${BASE_URL}/DeleteSupplierById?supplierId=${supplierId}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Fetch all suppliers
export async function findAllSuppliers(): Promise<any[]> {
  try {
    const url = `${BASE_URL}/FindAllSuppliers`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch suppliers');
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

// Update supplier status
export async function updateSupplierStatus(
  supplierId: string,
  status: string
): Promise<Response> {
  const url = `${BASE_URL}/UpdateSupplierStatus`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      supplierId,
      status,
    }),
  });
}