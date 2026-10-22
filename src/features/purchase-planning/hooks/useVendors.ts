// import { useQuery } from '@tanstack/react-query';
// import { fetchVendors } from '../api/purchasePlanningApi';


// export function useVendors() {
//   return useQuery({
//     queryKey: ['purchase-planning', 'vendors'],
//     queryFn: fetchVendors,
//     staleTime: 8 * 60 * 1000,
//   });
// }
import { useQuery } from '@tanstack/react-query';
import { fetchVendors } from '../api/purchasePlanningApi';

export function useVendors() {
  return useQuery({
    queryKey: ['purchase-planning', 'vendors'],
    queryFn: fetchVendors,
    staleTime: 30 * 60 * 1000,      // the list changes rarely
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}