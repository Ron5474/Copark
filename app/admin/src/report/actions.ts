export async function fetchAdminReport(token: string, numDays: number): Promise<string> {
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