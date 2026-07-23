"use client";

import { CreateAuctionPayload, GetAuctionDetailsResponse, GetAuctionsResponse, UseGetAllAuctionsOptions, UseGetAuctionDetailsOptions } from "@/types/AuctionType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


interface DeleteProductPayload {
    id: string;
}

interface UseDeleteProductOptions {
    token: string | null;
    invalidateQueryKeys?: string[][];
    onSuccessCallback?: () => void;
}


export const useAuctionProductsQuery = (
    token: string | null,
    searchTerm: string = "",
    isOpen: boolean = true
) => {
    return useQuery({
        queryKey: ["auctionProductsModal", searchTerm],
        queryFn: async () => {
            if (!token) return { data: [] };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/products/auctions?searchTerm=${encodeURIComponent(
                    searchTerm
                )}&limit=30`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Failed to fetch auction products");
            }

            return result;
        },
        enabled: isOpen && !!token,
    });
};

// Publish auction mutation hook
export const useAuctionHook = (token: string | null) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const publishAuctionMutation = useMutation({
        mutationKey: ["publishAuction"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: async (payload: any) => {
            if (!token) {
                throw new Error("Authorization token is missing. Please login again.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/products/auctions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Failed to publish auction");
            }

            return result;
        },
        onSuccess: async (data) => {
            toast.success(data.message || "Auction published successfully!");
            await queryClient.invalidateQueries({ queryKey: ["auctionData"] });
            await queryClient.invalidateQueries({ queryKey: ["inventoryData"] });
            await queryClient.invalidateQueries({ queryKey: ["dashboardReports"] });
            localStorage.removeItem("selected_auction_products");
            router.push("/dashboard/auctions");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong while publishing.");
        },
    });

    return {
        publishAuctionMutation,
    };
};


export const useAddAuctionHook = (token: string | null) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    // Publish Auction Mutation
    const publishAuctionMutation = useMutation({
        mutationKey: ["publishAuction"],
        mutationFn: async (payload: CreateAuctionPayload) => {
            if (!token) {
                throw new Error("Authorization token is missing. Please login again.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auctions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Failed to publish auction");
            }

            return result;
        },
        onSuccess: async (data) => {
            toast.success(data.message || "Auction published successfully!");

            // Invalidate relevant cache lists
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["auctionData"] }),
                queryClient.invalidateQueries({ queryKey: ["inventoryData"] }),
                queryClient.invalidateQueries({ queryKey: ["dashboardReports"] }),
            ]);

            localStorage.removeItem("selected_auction_products");
            router.push("/dashboard/auctions");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong while publishing.");
        },
    });

    return {
        publishAuctionMutation,
    };
};


export const useDeleteProductHook = ({
    token,
    invalidateQueryKeys = [["inventoryData"], ["auctionData"]],
    onSuccessCallback,
}: UseDeleteProductOptions) => {
    const queryClient = useQueryClient();

    const deleteProductMutation = useMutation({
        mutationKey: ["deleteProduct"],
        mutationFn: async ({ id }: DeleteProductPayload) => {
            if (!token) {
                throw new Error("Authorization token is missing. Please login again.");
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/products/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Failed to delete product");
            }

            return result;
        },
        onSuccess: async (data) => {
            toast.success(data.message || "Product deleted successfully!");

            // Invalidate provided query keys in parallel
            if (invalidateQueryKeys.length > 0) {
                await Promise.all(
                    invalidateQueryKeys.map((queryKey) =>
                        queryClient.invalidateQueries({ queryKey })
                    )
                );
            }

            // Execute custom callback if provided
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong while deleting.");
        },
    });

    return {
        deleteProductMutation,
    };
};



export const useGetAllAuctionsHook = ({
  token,
  page = 1,
  limit = 10,
  enabled = true,
}: UseGetAllAuctionsOptions) => {
  const auctionsQuery = useQuery<GetAuctionsResponse, Error>({
    queryKey: ["auctionData", page, limit],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authorization token is missing. Please login again.");
      }

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auctions?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to fetch auctions");
      }

      return result;
    },
    enabled: Boolean(token) && enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    auctions: auctionsQuery.data?.data || [],
    meta: auctionsQuery.data?.meta,
    isLoading: auctionsQuery.isLoading,
    isError: auctionsQuery.isError,
    error: auctionsQuery.error,
    refetchAuctions: auctionsQuery.refetch,
    auctionsQuery,
  };
};



export const useGetAuctionDetailsHook = ({
  auctionId,
  token,
  enabled = true,
}: UseGetAuctionDetailsOptions) => {
  const query = useQuery<GetAuctionDetailsResponse, Error>({
    queryKey: ["auctionDetail", auctionId],
    queryFn: async () => {
      if (!auctionId) {
        throw new Error("Auction ID is required.");
      }

      if (!token) {
        throw new Error("Authorization token is missing. Please login again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auctions/${auctionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to fetch auction details");
      }

      return result;
    },
    // Only execute if we have both the auctionId and token
    enabled: Boolean(auctionId) && Boolean(token) && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  return {
    auction: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    query,
  };
};