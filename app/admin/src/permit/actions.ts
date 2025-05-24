'use server'
import { cookies } from 'next/headers';
import { PermitsByDay, Zone } from '../types';

const API_URL = 'http://localhost:4003/graphql';

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return token;
};

export async function getAllPermitsByDay(): Promise<PermitsByDay[]> {
  const token = await getAuthToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetPermitStats {
          getPermitStats {
            date
            permits {
              vehicle
              type
              area
              activeDate
              expireDate
            }
          }
        }
      `
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getPermitStats;
}

export async function createZone(input: {
  zone: number,
  hourly?: number,
  maxDuration?: { hours: number, minutes: number },
  openTime?: string,
  closeTime?: string
}): Promise<boolean> {
  // Transform the flat input structure into the required nested structure
  const zoneInput = {
    zone: input.zone,
    weekday: {
      hourly: input.hourly,
      maxDuration: input.maxDuration,
      openTime: input.openTime,
      closeTime: input.closeTime
    },
    weekend: {
      hourly: input.hourly,
      maxDuration: input.maxDuration,
      openTime: input.openTime,
      closeTime: input.closeTime
    }
  };

  const token = await getAuthToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation CreateZone($input: NewZone!) {
          createZone(input: $input)
        }
      `,
      variables: {
        input: zoneInput
      }
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.createZone;
}



export async function getZones(): Promise<Zone[]> {
  const token = await getAuthToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetZones {
          getZones {
            zone
            hourly
            maxDuration {
              hours
              minutes
            }
            openTime
            closeTime
          }
        }
      `
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getZones;
}
