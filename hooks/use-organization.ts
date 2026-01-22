import { useMemo } from 'react';
import { useGetOrganizationByIdQuery, useGetRestaurantByIdQuery } from '@/state/api';
import type { Organization, Restaurant } from '@/lib/interfaces';
import { getMetadataId, unwrapApiData } from '@/lib/utils/formatters';
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

export function useOrganization() {
  const { raw: user } = useUser();
  const appMeta = (user?.app_metadata ?? {}) as Record<string, any>;
  const organizationId = getMetadataId(
    appMeta,
    'organization_id',
    'organizationId',
    'organization'
  );

  const query = useGetOrganizationByIdQuery(organizationId ?? '', {
    skip: !organizationId,
  });

  const organization = useMemo(
    () => unwrapApiData<Organization>(query.data),
    [query.data]
  );

  return {
    organizationId,
    organization,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRestaurant() {
  const { raw: user } = useUser();
  const appMeta = (user?.app_metadata ?? {}) as Record<string, any>;
  const restaurantId = getMetadataId(
    appMeta,
    'restaurant_id',
    'restaurantId',
    'restaurant'
  );

  const query = useGetRestaurantByIdQuery(restaurantId ?? '', {
    skip: !restaurantId,
  });

  const restaurant = useMemo(
    () => unwrapApiData<Restaurant>(query.data),
    [query.data]
  );

  return {
    restaurantId,
    restaurant,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
