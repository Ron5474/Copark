'use server';
import { cookies } from 'next/headers';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export async function getTicketsByDay() {
  const token = await getAuthToken();
  const query = `
    query {
      getTicketsStats{
        date
        tickets {
          id
          issuedDate
        }
      }
    }
  `

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result.data.getTicketsStats
}

export async function getTicketsByEnforcer(enforcerId: string) {
  const token = await getAuthToken();
  const query = `
    query GetTicketsPerDayFromEnforcer($enforcerID: String!) {
      getTicketsPerDayFromEnforcer(enforcerID: $enforcerID) {
        date
        tickets {
          id
          issuedDate
        }
      }
    }
  `

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables: {
        enforcerID: enforcerId
      }
    })
  })

  const result = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result.data.getTicketsPerDayFromEnforcer
}

export async function getChallengedTickets() {
  const token = await getAuthToken();
  const query = `
    query {
      getChallengedTickets {
        id
        vehicle
        enforcer
        issuedDate
        violation
        fine
        ticketStatus
        images
        note
        challengeReason
      }
    }
  `;

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getChallengedTickets;
}

export async function acceptTicketChallenge(ticketId: string) {
  const token = await getAuthToken();
  const mutation = `
    mutation AcceptTicketChallenge($ticketID: TicketInput!) {
      acceptTicketChallenge(ticketID: $ticketID) {
        id
        ticketStatus
        violation
        fine
        issuedDate
      }
    }
  `;

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        ticketID: { id: ticketId }
      }
    })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.acceptTicketChallenge;
}

export async function rejectTicketChallenge(ticketId: string) {
  const token = await getAuthToken();
  const mutation = `
    mutation RejectTicketChallenge($ticketID: TicketInput!) {
      rejectTicketChallenge(ticketID: $ticketID) {
        id
        ticketStatus
        violation
        fine
        issuedDate
      }
    }
  `;

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        ticketID: { id: ticketId }
      }
    })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.rejectTicketChallenge;
}

export async function getAcceptedTickets() {
  const token = await getAuthToken();
  const query = `
    query {
      getAcceptedTickets {
        id
        vehicle
        enforcer
        issuedDate
        violation
        fine
        ticketStatus
        images
        note
      }
    }
  `;

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getAcceptedTickets;
}

export async function getUnpaidTickets() {
  const token = await getAuthToken();
  const mutation = `
    mutation {
      getUnpaidTickets {
        id
        vehicle
        enforcer 
        issuedDate
        violation
        fine
        ticketStatus
        images
        note
      }
    }
  `;

  const response = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query: mutation })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getUnpaidTickets;
}
