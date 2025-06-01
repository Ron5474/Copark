'use server'
import { cookies } from 'next/headers';
import { PermitsByDay, Zone, ZoneStat, LotStat, Permit, PermitReport, LotGroup } from '../types';

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
  return result.data.getZones;
}

export async function getAllPermits(activeOnly = true): Promise<Permit[]> {
  const token = await getAuthToken();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query AllPermits($activeOnly: Boolean) {
          allPermits(activeOnly: $activeOnly) {
            type
            area
            purchaseDate
            activeDate
            expireDate
          }
        }
      `,
      variables: { activeOnly },
    }),
  });

  const result = await response.json();
  return result.data.allPermits;
}

export async function getPermitStatsByZone(activeOnly = true): Promise<ZoneStat[]> {
  const token = await getAuthToken();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query ZoneStats($activeOnly: Boolean) {
          allZoneStats(activeOnly: $activeOnly) {
            area
            totalPermits
          }
        }
      `,
      variables: { activeOnly },
    }),
  });

  const result = await response.json();
  return result.data.allZoneStats;
}

export async function getPermitStatsByLot(activeOnly = true): Promise<LotStat[]> {
  const token = await getAuthToken();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query LotStats($activeOnly: Boolean) {
          allLotStats(activeOnly: $activeOnly) {
            area
            totalPermits
          }
        }
      `,
      variables: { activeOnly },
    }),
  });

  const result = await response.json();
  return result.data.allLotStats;
}

export async function getPermitReport(): Promise<PermitReport> {
  const token = await getAuthToken()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query {
          adminPermitReport {
            totalPermits
            activePermits
            expiredPermits
            totalRevenue
            zoneBreakdown { area totalPermits }
            lotBreakdown { area totalPermits }
          }
        }
      `,
    }),
  })

  const json = await res.json()
  return json.data.adminPermitReport
}

export async function updateZonePrice(input: {
  zone: string,
  hourly?: number,
  maxDuration?: { hours: number, minutes: number },
  openTime?: string,
  closeTime?: string
}): Promise<Zone[]> {
  const token = await getAuthToken();
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation UpdateZonePrice($input: ZoneInput!) {
          updateZonePrice(input: $input) {
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
      `,
      variables: {
        input
      }
    }),
  });

  const result = await response.json();
  return result.data.updateZonePrice;
}

export async function getAllLotDetails(): Promise<LotGroup[]> {
  const token = await getAuthToken();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query {
          allLotDetails {
            id
            title
            lots {
              name
              price
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

  return result.data.allLotDetails;
}

