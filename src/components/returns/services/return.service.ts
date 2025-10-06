import { CustomerReturn } from "@/types/return";

class ReturnService {
    private baseUrl = import.meta.env.VITE_API_URL;

    async createReturn(returnData: Omit<CustomerReturn, 'id' | 'returnDate'>) {
        try {
            const response = await fetch(`${this.baseUrl}/returns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...returnData,
                    returnDate: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create return');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating return:', error);
            throw error;
        }
    }

    async getReturns() {
        try {
            const response = await fetch(`${this.baseUrl}/returns`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch returns');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching returns:', error);
            throw error;
        }
    }
}

export const returnService = new ReturnService();