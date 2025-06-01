'use server'
import { cookies } from 'next/headers';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export async function fetchAdminReport(numDays: number): Promise<string| undefined> {

    const token = await getAuthToken();
    if (!token) {
      alert('No auth token found.');
      return undefined;
    }

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GenerateReport($numDays: Float!) {
          generateReport(numDays: $numDays)
        }
      `,
      variables: { numDays }
    }),
  });

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  return data.data.generateReport;
}