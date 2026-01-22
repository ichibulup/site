import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  BaseQueryArg,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import {
  User,
  CategoryDataColumn,
  IngredientDataColumn,
  MenuDataColumn,
  MenuItemDataColumn,
  RecipeDataColumn,
  ReservationDataColumn,
  ReservationStatus,
  TableDataColumn,
  Cart,
  CartItem
} from "@/lib/interfaces";
import { supabase } from "@/lib/supabase";

type CartWithItems = Cart & { items?: CartItem[] };

const authorizeBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
    prepareHeaders: async (headers) => {
      const token = supabase.auth.getSession();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const errorData = result.error.data;
      const errorMessage =
        errorData?.message ||
        result.error.status.toString() ||
        "An error occurred";
      toast.error(`Error: ${errorMessage}`);
    }

    const isMutationRequest =
      (args as FetchArgs).method && (args as FetchArgs).method !== "GET";

    if (isMutationRequest) {
      const successMessage = result.data?.message;
      if (successMessage) toast.success(successMessage);
    }

    if (result.data) {
      result.data = result.data.data;
    } else if (
      result.error?.status === 204 ||
      result.meta?.response?.status === 24
    ) {
      return { data: null };
    }

    return result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

const baseQueryWithAuthOld: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
    prepareHeaders: async (headers) => {
      try {
        if (typeof window !== 'undefined') {
          // Try to get from localStorage first (Supabase client stores session here)
          const supabaseAuthKey = Object.keys(localStorage).find(key =>
            key.includes('auth-token') && key.startsWith('sb-')
          );

          if (supabaseAuthKey) {
            try {
              const sessionData = localStorage.getItem(supabaseAuthKey);
              if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session?.access_token) {
                  headers.set("Authorization", `Bearer ${session.access_token}`);
                  return headers;
                }
              }
            } catch (e) {
              console.warn('Failed to parse Supabase session from localStorage:', e);
            }
          }

          // Fallback: Try to get from cookies (Supabase cookie format)
          const cookies = document.cookie.split('; ');
          const supabaseCookie = cookies.find(row => row.includes('-auth-token'));

          if (supabaseCookie) {
            try {
              const cookieValue = supabaseCookie.split('=')[1];
              if (cookieValue) {
                const decoded = decodeURIComponent(cookieValue);
                const parsed = JSON.parse(decoded);
                if (parsed?.access_token) {
                  headers.set("Authorization", `Bearer ${parsed.access_token}`);
                }
              }
            } catch (e) {
              // Silently fail - cookie format không được hỗ trợ
              // console.warn('Failed to parse Supabase cookie:', e);
            }
          }
        }
      } catch (error) {
        console.warn('Không thể lấy token xác thực:', error);
      }
      return headers;
    },
  });

  // Call baseQuery and return the result directly
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const errorData = result.error.data as any;
    const status = result.error.status;
    let errorMessage = "Có lỗi xảy ra";

    // Xử lý GraphQL errors
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      const graphqlErrors = errorData.errors;
      errorMessage = graphqlErrors.map((err: any) => err.message).join(', ');
    }
    // Xử lý REST API errors
    else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (typeof status === 'number') {
      switch (status) {
        case 401:
          errorMessage = "Phiên đăng nhập đã hết hạn";
          break;
        case 403:
          errorMessage = "Bạn không có quyền thực hiện hành động này";
          break;
        case 404:
          errorMessage = "Không tìm thấy dữ liệu";
          break;
        case 500:
          errorMessage = "Lỗi server nội bộ";
          break;
        default:
          errorMessage = `Lỗi ${status}`;
      }
    }

    console.log('API Error:', {
      status,
      errorData,
      args,
      isGraphQL: !!(errorData?.errors)
    });

    // Chỉ hiển thị toast cho lỗi nghiêm trọng
    if (typeof status === 'number' && status >= 400) {
      // Danh sách các endpoint không hiển thị toast
      const silentEndpoints = [
        '/auth/register',
        '/auth/me', // Không show toast cho /me vì sẽ gọi nhiều lần
      ];

      const shouldShowToast = !silentEndpoints.some(endpoint =>
        (args as any)?.url?.includes?.(endpoint) ||
        (typeof args === 'string' && args.includes(endpoint))
      );

      // Đặc biệt không show toast cho 401 của /auth/me
      const is401OnMe = status === 401 && (
        (args as any)?.url?.includes?.('/auth/me') ||
        (typeof args === 'string' && args.includes('/auth/me'))
      );

      if (shouldShowToast && !is401OnMe) {
        toast.error(errorMessage);
      }
    }
  }

  // Kiểm tra và hiển thị thông báo thành công cho mutations
  if (result.data && !result.error) {
    const isMutationRequest = typeof args === 'object' &&
      args.method &&
      args.method !== "GET";

    if (isMutationRequest) {
      const responseData = result.data as any;
      if (responseData?.message && typeof responseData.message === 'string') {
        toast.success(responseData.message);
      }
    }
  }

  // Xử lý GraphQL response - GraphQL trả về trực tiếp data, không cần unwrap
  // Chỉ unwrap nếu là REST API response có cấu trúc { data: ... }
  if (result.data && typeof result.data === 'object') {
    const payload = result.data as any;
    // Chỉ unwrap nếu không phải GraphQL response (GraphQL không có 'data' wrapper)
    if (payload && 'data' in payload && !payload.query && !payload.mutation) {
      return { ...result, data: payload.data };
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: authorizeBaseQuery,
  reducerPath: "api",
  tagTypes: [
    "Auth",
    "User",
    "Restaurant",
    "Order",
    "Menu",
    "Category",
    "Recipe",
    "Inventory",
    "Table",
    "Reservation",
    "Promotion",
    "Voucher",
    "Analytics",
    "Delivery",
    "Feedback",
    "Finance",
    "Marketplace",
    "Cart",
    "Notification",
    "Organization",
    "RestaurantRole",
    "Supply",
    "Wallet"
  ],
  endpoints: (build) => ({
    // ========== GRAPHQL API ENDPOINTS ==========
    graphqlFirst: build.query<any, any>({
      query: (data) => ({
        url: "/graphql",
        method: "POST",
        body: data,
      }),
    }),
    graphqlSecond: build.mutation<any, any>({
      query: (data) => ({
        url: "/graphql",
        method: "POST",
        body: data,
      }),
    }),
    // GraphQL Subscriptions (placeholder - requires WebSocket implementation)
    // graphqlSubscription: build.query<any, any>({
    //   query: (data) => ({
    //     url: "/graphql",
    //     method: "POST",
    //     body: data,
    //   }),
    //   // Note: Real subscriptions require WebSocket connection
    //   // This is a placeholder for future implementation
    // }),

    // ========== API ENDPOINTS ==========
    // ------------------------------------------------------------------------
    // Upload
    // ------------------------------------------------------------------------
    callback: build.mutation<any, void>({
      async queryFn(arg, api, extraOptions, baseQuery): Promise<any> {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return {
              error: {
                status: 401,
                data: { error: "Unauthorized" },
              },
            };
          }

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError || !session) {
            return {
              error: {
                status: 401,
                data: { error: "No active session" },
              },
            };
          }

          const response = await baseQuery({
            url: '/auth/callback',
            method: 'POST',
            credentials: 'include',
            body: {
              session,
            },
          });

          if (response.error) {
            const errorData = response.error.data as any;
            return {
              error: {
                status: response.error.status || 500,
                data: {
                  error: errorData?.message || errorData?.error || 'Failed to sync user',
                  details: errorData,
                },
              },
            };
          }

          const payload = response.data as any;

          return {
            data: {
              success: true,
              message: 'User synced successfully',
              // user: payload?.user,
              // dbUser: payload?.dbUser,
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status || 500,
              data: {
                error: 'Internal server error',
                message: error.response?.data || error.message,
              },
            },
          };
        }
      },
      // providesTags: ["Auth"],
    }),
    me: build.mutation<any, User>({
      async queryFn(arg, api, extraOptions, baseQuery): Promise<any> {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return {
              error: {
                status: 401,
                data: { error: "Unauthorized" },
              },
            };
          }

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError || !session) {
            return {
              error: {
                status: 401,
                data: { error: "No active session" },
              },
            };
          }

          const response = await baseQuery({
            url: '/auth/me',
            method: 'POST',
            credentials: 'include',
            body: {
              session,
            },
          });

          if (response.error) {
            const errorData = response.error.data as any;
            return {
              error: {
                status: response.error.status || 500,
                data: {
                  error: errorData?.message || errorData?.error || 'Failed to sync user',
                  details: errorData,
                },
              },
            };
          }

          const payload = response.data as any;

          return {
            data: {
              success: true,
              message: 'User synced successfully',
              user: payload?.user,
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status || 500,
              data: {
                error: 'Internal server error',
                message: error.response?.data || error.message,
              },
            },
          };
        }
      },
      // providesTags: ["Auth"],
    }),

    // ========== API ENDPOINTS ==========
    // ------------------------------------------------------------------------
    // Upload
    // ------------------------------------------------------------------------
    upload: build.mutation<any, any>({
      query: (data) => ({
        url: "/upload",
        method: "POST",
        body: data,
      }),
    }),
    // ========== API ENDPOINTS ==========
    // ------------------------------------------------------------------------
    // Categories CRUD
    // ------------------------------------------------------------------------
    getAllCategories: build.query<CategoryDataColumn[], void>({
      query: () => ({
        url: `/category`
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Category"],
    }),
    getCategoryById: build.query<any, string>({
      query: (id) => ({
        url: `/category/${id}`
      }),
      providesTags: ["Category"],
    }),
    createCategory: build.mutation<any, any>({
      query: (data) => ({
        url: `/category`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: build.mutation<
      any,
      { id: string; data: any; }
    >({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateStatusCategory: build.mutation<any, { id: string, status: { isActive: boolean } }>({
      query: ({ id, status }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body: status,
      })
    }),
    deleteCategory: build.mutation<any, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    deleteHardCategory: build.mutation<any, string>({
      query: (id) => ({
        url: `/category/hard/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    // ------------------------------------------------------------------------
    // Menus CRUD
    // ------------------------------------------------------------------------
    getAllMenus: build.query<MenuDataColumn[], { organizationId?: string } | void>({
      query: (params) => ({
        url: `/menu`,
        params: { page: 1, limit: 100, ...(params ?? {}) },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Menu"],
    }),
    // ------------------------------------------------------------------------
    getMenus: build.query<MenuDataColumn[], Record<string, any> | void>({
      query: (params) => ({
        url: `/menu`,
        params: params ?? undefined,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Menu"],
    }),
    getMenuById: build.query<any, string>({
      query: (id) => `/menu/${id}`,
      providesTags: (result, error, id) => [{ type: "Menu", id }],
    }),
    createMenu: build.mutation<any, any>({
      query: (data) => ({
        url: "/menu",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Menu"],
    }),
    updateMenu: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/menu/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Menu"],
    }),
    deleteMenu: build.mutation<any, string>({
      query: (id) => ({
        url: `/menu/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),

    // Menu extras
    getMenusByRestaurant: build.query<any, string>({
      query: (restaurantId) => `/menu/restaurant/${restaurantId}`,
      providesTags: ["Menu"],
    }),
    getMenuStatsByRestaurant: build.query<any, string>({
      query: (restaurantId) => `/menu/restaurant/${restaurantId}/stats`,
      providesTags: ["Menu"],
    }),
    getFeaturedMenuItems: build.query<any[], void>({
      query: () => `/menu/item/featured`,
      providesTags: ["Menu"],
    }),
    getMenuItems: build.query<any[], Record<string, any> | void>({
      query: (params) => ({
        url: `/menu/item`,
        params: params ?? undefined
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Menu"],
    }),
    createMenuItem: build.mutation<any, any>({
      query: (data) => ({
        url: `/menu/item`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Menu"],
    }),
    getMenuItemById: build.query<any, string>({
      query: (id) => `/menu/item/${id}`,
      providesTags: ["Menu"],
    }),
    updateMenuItem: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/menu/item/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Menu"],
    }),
    deleteMenuItem: build.mutation<any, string>({
      query: (id) => ({
        url: `/menu/item/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Menu"],
    }),
    bulkUpdateMenuItems: build.mutation<any, any>({
      query: (data) => ({
        url: `/menu/item/bulk-update`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Menu"],
    }),
    bulkToggleMenuItemsAvailability: build.mutation<any, any>({
      query: (data) => ({
        url: `/menu/item/bulk-toggle-availability`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Menu"],
    }),
    // ------------------------------------------------------------------------
    getAllMenuItems: build.query<MenuItemDataColumn[], void>({
      query: () => ({
        url: `/menu/item`,
        // params: { page: 1, limit: 100 },
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Menu"],
    }),
    // ------------------------------------------------------------------------
    // Recipes CRUD
    // ------------------------------------------------------------------------
    getRecipeByMenuItemId: build.query<RecipeDataColumn, string>({
      query: (id) => ({
        url: `/menu/recipe/menu-item/${id}`
      }),
      providesTags: ["Recipe"],
    }),
    // ------------------------------------------------------------------------
    // Inventories CRUD
    // ------------------------------------------------------------------------
    getAllInventoryItems: build.query<IngredientDataColumn[], void>({
      query: () => ({
        url: "/inventory/item"
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Inventory"],
    }),
    // ------------------------------------------------------------------------
    // Inventory
    createInventoryItem: build.mutation<any, any>({
      query: (data) => ({
        url: `/inventory/item`,
        method: "POST",
        body: data
      }),
    }),
    getInventoryItems: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/inventory/item`, params: params ?? {} }),
      transformResponse: (response: any) => response?.data ?? response,
    }),
    bulkUpdateInventory: build.mutation<any, any>({
      query: (data) => ({ url: `/inventory/item/bulk-update-quantities`, method: "PATCH", body: data }),
    }),
    getLowStockAlert: build.query<any, void>({ query: () => `/inventory/item/low-stock` }),
    getInventoryItemById: build.query<any, string>({
      query: (id) => `/inventory/item/${id}`,
      transformResponse: (response: any) => response?.data ?? response,
    }),
    updateInventoryItem: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/inventory/item/${id}`,
        method: "PUT",
        body: data
      }),
    }),
    deleteInventoryItem: build.mutation<any, string>({
      query: (id) => ({
        url: `/inventory/item/${id}`,
        method: "DELETE"
      }),
    }),
    getInventoryItemsByRestaurantId: build.query<any, string>({
      query: (restaurantId) => ({
        url: `/inventory/item`,
        params: { restaurantId },
      }),
    }),
    createInventoryTransaction: build.mutation<any, any>({
      query: (data) => ({ url: `/inventory/transaction`, method: "POST", body: data }),
    }),

    // ------------------------------------------------------------------------
    // Inventory Balance
    // ------------------------------------------------------------------------
    getInventoryBalances: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: `/inventory/balance`, params: params ?? {} }),
      providesTags: ["Inventory"],
    }),
    getInventoryBalanceById: build.query<any, string>({
      query: (id) => `/inventory/balance/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    createInventoryBalance: build.mutation<any, any>({
      query: (data) => ({
        url: `/inventory/balance`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    updateInventoryBalance: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/inventory/balance/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteInventoryBalance: build.mutation<any, string>({
      query: (id) => ({
        url: `/inventory/balance/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Inventory"],
    }),

    // ------------------------------------------------------------------------
    // Warehouse CRUD
    // ------------------------------------------------------------------------
    getWarehouses: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: `/warehouse`, params: params ?? {} }),
      providesTags: ["Inventory"],
    }),
    getWarehouseById: build.query<any, string>({
      query: (id) => `/warehouse/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    createWarehouse: build.mutation<any, any>({
      query: (data) => ({
        url: `/warehouse`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    updateWarehouse: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/warehouse/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteWarehouse: build.mutation<any, string>({
      query: (id) => ({
        url: `/warehouse/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Inventory"],
    }),

    // ------------------------------------------------------------------------
    // Warehouse Receipt (Import)
    // ------------------------------------------------------------------------
    getWarehouseReceipts: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: `/warehouse/receipt`, params: params ?? {} }),
      providesTags: ["Inventory"],
    }),
    getWarehouseReceiptById: build.query<any, string>({
      query: (id) => `/warehouse/receipt/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    createWarehouseReceipt: build.mutation<any, any>({
      query: (data) => ({
        url: `/warehouse/receipt`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    updateWarehouseReceipt: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/warehouse/receipt/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteWarehouseReceipt: build.mutation<any, string>({
      query: (id) => ({
        url: `/warehouse/receipt/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Inventory"],
    }),

    // ------------------------------------------------------------------------
    // Warehouse Issue (Export)
    // ------------------------------------------------------------------------
    getWarehouseIssues: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: `/warehouse/issue`, params: params ?? {} }),
      providesTags: ["Inventory"],
    }),
    getWarehouseIssueById: build.query<any, string>({
      query: (id) => `/warehouse/issue/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    createWarehouseIssue: build.mutation<any, any>({
      query: (data) => ({
        url: `/warehouse/issue`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    updateWarehouseIssue: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/warehouse/issue/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteWarehouseIssue: build.mutation<any, string>({
      query: (id) => ({
        url: `/warehouse/issue/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Inventory"],
    }),

    // ------------------------------------------------------------------------
    // Warehouse Transfer
    // ------------------------------------------------------------------------
    getWarehouseTransfers: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: `/warehouse/transfer`, params: params ?? {} }),
      providesTags: ["Inventory"],
    }),
    getWarehouseTransferById: build.query<any, string>({
      query: (id) => `/warehouse/transfer/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    createWarehouseTransfer: build.mutation<any, any>({
      query: (data) => ({
        url: `/warehouse/transfer`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    updateWarehouseTransfer: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/warehouse/transfer/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteWarehouseTransfer: build.mutation<any, string>({
      query: (id) => ({
        url: `/warehouse/transfer/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Inventory"],
    }),
    getInventoryTransactions: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/inventory/transaction`, params: params ?? {} }),
    }),
    // ------------------------------------------------------------------------
    // Tables CRUD
    // ------------------------------------------------------------------------
    getAllTables: build.query<TableDataColumn[], void>({
      query: () => ({
        url: "/restaurant/table"
      }),
      providesTags: ["Table"],
    }),
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------

    // ========== CRUD API ENDPOINTS ==========

    // Users CRUD
    getMe: build.query<any, void>({
      query: () => "/user/me",
      providesTags: ["User"],
    }),
    getAllUsers: build.query<any[], void>({
      query: () => "/user",
      providesTags: ["User"],
    }),
    getUserById: build.query<any, string>({
      query: (id) => `/user/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: build.mutation<any, any>({
      query: (data) => ({
        url: "/user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation<any, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Restaurants CRUD
    getAllRestaurants: build.query<any[], void>({
      query: () => "/restaurant",
      providesTags: ["Restaurant"],
    }),
    getRestaurantById: build.query<any, string>({
      query: (id) => `/restaurant/${id}`,
      providesTags: (result, error, id) => [{ type: "Restaurant", id }],
    }),
    createRestaurant: build.mutation<any, any>({
      query: (data) => ({
        url: "/restaurant",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant"],
    }),
    updateRestaurant: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/restaurant/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Restaurant"],
    }),
    deleteRestaurant: build.mutation<any, string>({
      query: (id) => ({
        url: `/restaurant/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurant"],
    }),

    // Orders CRUD
    getAllOrders: build.query({
      query: () => '/order',
      providesTags: ['Order'],
      transformResponse: (response: any) => response?.data ?? response,
    }),
    getMyOrders: build.query({
      query: (params) => ({
        url: '/order',
        method: "GET",
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Order'],
    }),
    getMyOrder: build.query({
      query: (params) => ({
        url: '/order',
        method: "GET",
        params,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['Order'],
    }),
    // getMyOrders: build.query<any[], void>({
    //   query: () => `/order/my-order`,
    //   providesTags: ["Order"],
    // }),
    getOrderById: build.query<any, string>({
      query: (id) => `/order/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrder: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/order/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
    deleteOrder: build.mutation<any, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),

    // Orders extras
    getOrderStats: build.query<any, void>({
      query: () => `/order/statistics`,
      providesTags: ["Order"],
    }),
    getOrderAnalytics: build.query<any, void>({
      query: () => `/order/revenue`,
      providesTags: ["Order"],
    }),
    getCurrentOrder: build.query<any, void>({
      query: () => ({
        url: `/order`,
        params: { page: 1, limit: 1, sortBy: "createdAt", sortOrder: "desc" },
      }),
      transformResponse: (response: any) => {
        const payload = response?.data ?? response;
        return Array.isArray(payload) ? payload[0] ?? null : payload ?? null;
      },
      providesTags: ["Order"],
    }),
    getRestaurantOrders: build.query<any[], Record<string, any> | void>({
      query: (params) => ({
        url: `/order`,
        params: params ?? {},
      }),
      providesTags: ["Order"],
    }),
    getPendingOrders: build.query<any[], void>({
      query: () => ({
        url: `/order`,
        params: { status: "pending" },
      }),
      providesTags: ["Order"],
    }),
    getRestaurantDashboard: build.query<any, void>({
      query: () => `/order/statistics`,
      providesTags: ["Order"],
    }),
    getOrderByCode: build.query<any, string>({
      query: (orderCode) => ({
        url: `/order`,
        params: { search: orderCode, page: 1, limit: 1 },
      }),
      transformResponse: (response: any) => {
        const payload = response?.data ?? response;
        return Array.isArray(payload) ? payload[0] ?? null : payload ?? null;
      },
      providesTags: ["Order"],
    }),
    cancelOrder: build.mutation<any, string>({
      query: (id) => ({ url: `/order/${id}`, method: "PUT", body: { status: "cancelled" } }),
      invalidatesTags: ["Order"],
    }),
    bulkOrderActions: build.mutation<any, any>({
      query: (data) => ({ url: `/order/bulk-update-status`, method: "PATCH", body: data }),
      invalidatesTags: ["Order"],
    }),
    getKitchenOrders: build.query<any[], void>({
      query: () => ({
        url: `/order`,
        params: { status: "preparing" },
      }),
      providesTags: ["Order"],
    }),
    updateCookingStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/order/item/bulk-update-cooking-status`, method: "PATCH", body: data }),
      invalidatesTags: ["Order"],
    }),

    // Vouchers
    createVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/promotion/vouchers`, method: "POST", body: data }),
      invalidatesTags: ["Voucher"],
    }),
    getVouchers: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/promotion/vouchers`, params: params ?? {} }),
      providesTags: ["Voucher"],
    }),
    getVoucherById: build.query<any, string>({
      query: (id) => `/promotion/vouchers/${id}`,
      providesTags: ["Voucher"],
    }),
    getVoucherByCode: build.query<any, string>({
      query: (code) => `/promotion/vouchers/code/${code}`,
      providesTags: ["Voucher"],
    }),
    updateVoucher: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/promotion/vouchers/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Voucher"],
    }),
    deleteVoucher: build.mutation<any, string>({
      query: (id) => ({ url: `/promotion/vouchers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Voucher"],
    }),
    validateVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/promotion/vouchers/validate`, method: "POST", body: data }),
    }),
    createVoucherUsage: build.mutation<any, any>({
      query: (data) => ({ url: `/promotion/voucher-usages`, method: "POST", body: data }),
    }),
    getVoucherUsageHistory: build.query<any, string>({
      query: (id) => `/promotion/voucher-usages/voucher/${id}`,
    }),

    // Promotions
    createPromotion: build.mutation<any, any>({
      query: (data) => ({ url: `/promotion/promotions`, method: "POST", body: data }),
      invalidatesTags: ["Promotion"],
    }),
    getPromotions: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/promotion/promotions`, params: params ?? {} }),
      providesTags: ["Promotion"],
    }),
    getPromotionById: build.query<any, string>({
      query: (id) => `/promotion/promotions/${id}`,
      providesTags: ["Promotion"],
    }),
    updatePromotion: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/promotion/promotions/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Promotion"],
    }),
    deletePromotion: build.mutation<any, string>({
      query: (id) => ({ url: `/promotion/promotions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Promotion"],
    }),
    getActivePromotionsForRestaurant: build.query<any, string>({
      query: (restaurantId) => `/promotion/promotions/active/${restaurantId}`,
      providesTags: ["Promotion"],
    }),

    // ///////////////////////
    createRecipe: build.mutation<any, any>({
      query: (data) => ({ url: `/menu/recipe`, method: "POST", body: data }),
    }),
    getRecipes: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/menu/recipe`, params: params ?? {} }),
    }),
    calculateRecipeCost: build.mutation<any, any>({
      query: (data) => ({ url: `/menu/recipe/calculate-cost`, method: "POST", body: data }),
    }),
    getRecipeById: build.query<any, string>({ query: (id) => `/menu/recipe/${id}` }),
    updateRecipe: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/menu/recipe/${id}`, method: "PUT", body: data }),
    }),
    getInventoryStats: build.query<any, void>({ query: () => `/stats/inventory` }),
    checkQRInventory: build.mutation<any, any>({
      query: (data) => ({ url: `/inventory/qr-check`, method: "POST", body: data }),
    }),
    quickStockUpdate: build.mutation<any, any>({
      query: (data) => ({ url: `/inventory/quick-update`, method: "POST", body: data }),
    }),

    // Tables
    createTable: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/table`, method: "POST", body: data }),
    }),
    getTables: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/restaurant/table`, params: params ?? {} }),
    }),
    getTableById: build.query<any, string>({ query: (id) => `/restaurant/table/${id}` }),
    updateTable: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/restaurant/table/${id}`, method: "PUT", body: data }),
    }),
    deleteTable: build.mutation<any, string>({
      query: (id) => ({ url: `/restaurant/table/${id}`, method: "DELETE" }),
    }),
    getTablesByRestaurant: build.query<any, string>({
      query: (restaurantId) => ({
        url: `/restaurant/table`,
        params: { restaurantId },
      }),
    }),
    updateTableStatus: build.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/restaurant/table/${id}`, method: "PUT", body: { status } }),
    }),
    checkTableAvailability: build.mutation<any, Record<string, any>>({
      query: (params) => ({ url: `/restaurant/table/availability`, method: "GET", params }),
    }),

    // Reservations
    getAllReservations: build.query<ReservationDataColumn[], void>({
      query: () => ({
        url: `/restaurant/reservation`,
      }),
      providesTags: ["Reservation"],
    }),
    updateStatusReservation: build.mutation<void, { id: string, status: ReservationStatus }>({
      query: ({ id, status }) => ({
        url: `/restaurant/reservation/${id}`,
        method: "PUT",
        body: { status },
      })
    }),
    createReservation: build.mutation<any, any>({
      query: (data) => ({
        url: `/restaurant/reservation`,
        method: "POST",
        body: data
      }),
    }),
    getReservations: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: `/restaurant/reservation`,
        params: params ?? {}
      }),
    }),
    getTodayReservations: build.query<any, void>({
      query: () => ({
        url: `/restaurant/reservation`,
        params: { page: 1, limit: 50 },
      })
    }),
    getUpcomingReservations: build.query<any, void>({
      query: () => ({
        url: `/restaurant/reservation`,
        params: { status: "confirmed", page: 1, limit: 50 },
      })
    }),
    checkAvailability: build.mutation<any, any>({
      query: (params) => ({ url: `/restaurant/table/availability`, method: "GET", params }),
    }),
    createWalkIn: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation`, method: "POST", body: data }),
    }),
    bulkUpdateReservations: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation/bulk-update-status`, method: "PATCH", body: data }),
    }),
    reservationAnalytics: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation/analytics`, method: "POST", body: data }),
    }),
    getReservationById: build.query<any, string>({ query: (id) => `/restaurant/reservation/${id}` }),
    updateReservation: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/restaurant/reservation/${id}`, method: "PUT", body: data }),
    }),
    updateReservationStatus: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/restaurant/reservation/${id}`, method: "PUT", body: data }),
    }),
    deleteReservation: build.mutation<any, string>({
      query: (id) => ({ url: `/restaurant/reservation/${id}`, method: "DELETE" }),
    }),

    // Reviews
    createRestaurantReview: build.mutation<any, any>({
      query: (data) => ({ url: `/reviews/restaurant`, method: "POST", body: data }),
    }),
    createMenuItemReview: build.mutation<any, any>({
      query: (data) => ({ url: `/reviews/menu-item`, method: "POST", body: data }),
    }),
    createOrderReview: build.mutation<any, any>({
      query: (data) => ({ url: `/reviews/order`, method: "POST", body: data }),
    }),
    getReviews: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/reviews`, params: params ?? {} }),
    }),
    getReviewStats: build.query<any, void>({ query: () => `/reviews/stats` }),
    getMyReviews: build.query<any, void>({ query: () => `/reviews/my-reviews` }),
    getReviewById: build.query<any, string>({ query: (id) => `/reviews/${id}` }),
    updateReview: build.mutation<any, { reviewId: string; data: any }>({
      query: ({ reviewId, data }) => ({ url: `/reviews/${reviewId}`, method: "PUT", body: data }),
    }),
    deleteReview: build.mutation<any, string>({
      query: (reviewId) => ({ url: `/reviews/${reviewId}`, method: "DELETE" }),
    }),
    addReviewResponse: build.mutation<any, { reviewId: string; data: any }>({
      query: ({ reviewId, data }) => ({ url: `/reviews/${reviewId}/response`, method: "POST", body: data }),
    }),
    bulkReviewAction: build.mutation<any, any>({
      query: (data) => ({ url: `/reviews/bulk-action`, method: "POST", body: data }),
    }),
    getRestaurantReviews: build.query<any, string>({
      query: (restaurantId) => `/reviews/restaurant/${restaurantId}`,
    }),
    getRestaurantReviewStats: build.query<any, string>({
      query: (restaurantId) => `/reviews/restaurant/${restaurantId}/stats`,
    }),
    getMenuItemReviews: build.query<any, string>({
      query: (menuItemId) => `/reviews/menu-item/${menuItemId}`,
    }),
    getMenuItemReviewStats: build.query<any, string>({
      query: (menuItemId) => `/reviews/menu-item/${menuItemId}/stats`,
    }),

    // Uploads
    uploadAvatar: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadFile: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadMultipleFiles: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/multiple`, method: "POST", body: formData }),
    }),
    uploadCategoryImage: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadMenuImage: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadMenuItemImage: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadRestaurantLogo: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadRestaurantCover: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),

    /*
    ===============
    USER CLERK
    ===============
    */
    // updateUserClerk: build.mutation<User, Partial<User> & { id: string }>({
    //   query: ({ id, ...updatedUser }) => ({
    //     url: `users/clerk/${id}`,
    //     method: "PUT",
    //     body: updatedUser,
    //   }),
    //   invalidatesTags: ["Users"],
    // }),

    /*
    ===============
    COURSES
    ===============
    */
    // getCourses: build.query<Course[], { category?: string }>({
    //   query: ({ category }) => ({
    //     url: "courses",
    //     params: { category },
    //   }),
    //   providesTags: ["Courses"],
    // }),

    // getCourse: build.query<Course, string>({
    //   query: (id) => `courses/${id}`,
    //   providesTags: (result, error, id) => [{ type: "Courses", id }],
    // }),

    // createCourse: build.mutation<
    //   Course,
    //   { teacherId: string; teacherName: string }
    // >({
    //   query: (body) => ({
    //     url: `courses`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["Courses"],
    // }),

    // updateCourse: build.mutation<
    //   Course,
    //   { courseId: string; formData: FormData }
    // >({
    //   query: ({ courseId, formData }) => ({
    //     url: `courses/${courseId}`,
    //     method: "PUT",
    //     body: formData,
    //   }),
    //   invalidatesTags: (result, error, { courseId }) => [
    //     { type: "Courses", id: courseId },
    //   ],
    // }),

    // deleteCourse: build.mutation<{ message: string }, string>({
    //   query: (courseId) => ({
    //     url: `courses/${courseId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Courses"],
    // }),

    // getUploadVideoUrl: build.mutation<
    //   { uploadUrl: string; videoUrl: string },
    //   {
    //     courseId: string;
    //     chapterId: string;
    //     sectionId: string;
    //     fileName: string;
    //     fileType: string;
    //   }
    // >({
    //   query: ({ courseId, sectionId, chapterId, fileName, fileType }) => ({
    //     url: `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url`,
    //     method: "POST",
    //     body: { fileName, fileType },
    //   }),
    // }),

    /*
    ===============
    TRANSACTIONS
    ===============
    */
    // getTransactions: build.query<Transaction[], string>({
    //   query: (userId) => `transactions?userId=${userId}`,
    // }),
    // createStripePaymentIntent: build.mutation<
    //   { clientSecret: string },
    //   { amount: number }
    // >({
    //   query: ({ amount }) => ({
    //     url: `/transactions/stripe/payment-intent`,
    //     method: "POST",
    //     body: { amount },
    //   }),
    // }),
    // createTransaction: build.mutation<Transaction, Partial<Transaction>>({
    //   query: (transaction) => ({
    //     url: "transactions",
    //     method: "POST",
    //     body: transaction,
    //   }),
    // }),

    /*
    ===============
    USER COURSE PROGRESS
    ===============
    */
    // getUserEnrolledCourses: build.query<Course[], string>({
    //   query: (userId) => `users/course-progress/${userId}/enrolled-courses`,
    //   providesTags: ["Courses", "UserCourseProgress"],
    // }),

    // getUserCourseProgress: build.query<
    //   UserCourseProgress,
    //   { userId: string; courseId: string }
    // >({
    //   query: ({ userId, courseId }) =>
    //     `users/course-progress/${userId}/courses/${courseId}`,
    //   providesTags: ["UserCourseProgress"],
    // }),

    // updateUserCourseProgress: build.mutation<
    //   UserCourseProgress,
    //   {
    //     userId: string;
    //     courseId: string;
    //     progressData: {
    //       sections: SectionProgress[];
    //     };
    //   }
    // >({
    //   query: ({ userId, courseId, progressData }) => ({
    //     url: `users/course-progress/${userId}/courses/${courseId}`,
    //     method: "PUT",
    //     body: progressData,
    //   }),
    //   invalidatesTags: ["UserCourseProgress"],
    //   async onQueryStarted(
    //     { userId, courseId, progressData },
    //     { dispatch, queryFulfilled }
    //   ) {
    //     const patchResult = dispatch(
    //       api.util.updateQueryData(
    //         "getUserCourseProgress",
    //         { userId, courseId },
    //         (draft) => {
    //           Object.assign(draft, {
    //             ...draft,
    //             sections: progressData.sections,
    //           });
    //         }
    //       )
    //     );
    //     try {
    //       await queryFulfilled;
    //     } catch {
    //       patchResult.undo();
    //     }
    //   },
    // }),

    // ========== NOTIFICATION API ENDPOINTS ==========
    getAllNotifications: build.query<any[], void>({
      query: () => "/notification/notifications",
      providesTags: ["Notification"],
    }),
    getNotificationById: build.query<any, string>({
      query: (id) => `/notification/notifications/${id}`,
      providesTags: ["Notification"],
    }),
    getMyNotifications: build.query<any[], void>({
      query: () => "/notification/notifications",
      providesTags: ["Notification"],
    }),
    markNotificationAsRead: build.mutation<any, string>({
      query: (id) => ({
        url: `/notification/notifications/${id}/mark-read`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsAsRead: build.mutation<any, void>({
      query: () => ({
        url: "/notification/notifications/bulk-mark-read",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: build.mutation<any, string>({
      query: (id) => ({
        url: `/notification/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ========== ORGANIZATION API ENDPOINTS ==========
    getAllOrganizations: build.query<any[], void>({
      query: () => "/organization",
      providesTags: ["Organization"],
    }),
    getOrganizationById: build.query<any, string>({
      query: (id) => `/organization/${id}`,
      providesTags: ["Organization"],
    }),
    createOrganization: build.mutation<any, any>({
      query: (data) => ({
        url: "/organization",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    updateOrganization: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/organization/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    deleteOrganization: build.mutation<any, string>({
      query: (id) => ({
        url: `/organization/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),
    getOrganizationMembers: build.query<
      any,
      | {
          organizationId?: string
          userId?: string
          role?: string
          page?: number
          limit?: number
        }
      | void
    >({
      query: (params) => ({
        url: "/organization/memberships",
        params: params ?? {},
      }),
      providesTags: ["Organization"],
    }),
    getOrganizationMembershipById: build.query<any, string>({
      query: (id) => `/organization/memberships/${id}`,
      providesTags: ["Organization"],
    }),
    createOrganizationMembership: build.mutation<any, any>({
      query: (data) => ({
        url: "/organization/memberships",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    updateOrganizationMembership: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/organization/memberships/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    deleteOrganizationMembership: build.mutation<any, string>({
      query: (id) => ({
        url: `/organization/memberships/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),
    bulkAddOrganizationMembers: build.mutation<any, any>({
      query: (data) => ({
        url: "/organization/memberships/bulk-add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    bulkUpdateOrganizationMemberRoles: build.mutation<any, any>({
      query: (data) => ({
        url: "/organization/memberships/bulk-update-roles",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),

    // Restaurant chain endpoints
    getRestaurantChains: build.query<any, { organizationId?: string; search?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/restaurant/chain",
        params: params ?? {},
      }),
      providesTags: ["Organization"],
    }),
    getRestaurantChainById: build.query<any, string>({
      query: (id) => `/restaurant/chain/${id}`,
      providesTags: ["Organization"],
    }),
    createRestaurantChain: build.mutation<any, any>({
      query: (data) => ({
        url: "/restaurant/chain",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    updateRestaurantChain: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/restaurant/chain/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    deleteRestaurantChain: build.mutation<any, string>({
      query: (id) => ({
        url: `/restaurant/chain/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),

    // Restaurant staff roles
    getRestaurantUserRoles: build.query<any[], Record<string, any> | void>({
      query: (params) => ({
        url: "/restaurant/role",
        params: params ?? {},
      }),
      providesTags: ["RestaurantRole"],
    }),
    getRestaurantUserRoleById: build.query<any, string>({
      query: (id) => `/restaurant/role/${id}`,
      providesTags: (result, error, id) => [{ type: "RestaurantRole", id }],
    }),
    createRestaurantUserRole: build.mutation<any, any>({
      query: (data) => ({
        url: "/restaurant/role",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RestaurantRole"],
    }),
    updateRestaurantUserRole: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/restaurant/role/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RestaurantRole"],
    }),
    deleteRestaurantUserRole: build.mutation<any, string>({
      query: (id) => ({
        url: `/restaurant/role/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RestaurantRole"],
    }),
    bulkAddRestaurantStaff: build.mutation<any, any>({
      query: (data) => ({
        url: "/restaurant/role/bulk-add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RestaurantRole"],
    }),
    transferRestaurantStaff: build.mutation<any, any>({
      query: (data) => ({
        url: "/restaurant/role/transfer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RestaurantRole"],
    }),
    getRestaurantStaffStatistics: build.query<any, string>({
      query: (restaurantId) => `/restaurant/role/restaurants/${restaurantId}/statistics`,
      providesTags: ["RestaurantRole"],
    }),

    // ========== SUPPLY API ENDPOINTS ==========
    getAllSupplies: build.query<any[], void>({
      query: () => "/supply",
      providesTags: ["Supply"],
    }),
    getSupplyById: build.query<any, string>({
      query: (id) => `/supply/${id}`,
      providesTags: ["Supply"],
    }),
    createSupply: build.mutation<any, any>({
      query: (data) => ({
        url: "/supply",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    updateSupply: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/supply/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    deleteSupply: build.mutation<any, string>({
      query: (id) => ({
        url: `/supply/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supply"],
    }),
    getSuppliers: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: "/supply", params: params ?? {} }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Supply"],
    }),
    createSupplier: build.mutation<any, any>({
      query: (data) => ({
        url: "/supply",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    registerSupplier: build.mutation<any, any>({
      query: (data) => ({
        url: "/supply/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    updateSupplier: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/supply/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    deleteSupplier: build.mutation<any, string>({
      query: (id) => ({
        url: `/supply/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supply"],
    }),
    getPurchaseOrders: build.query<any[], Record<string, any> | void>({
      query: (params) => ({ url: "/purchase/order", params: params ?? {} }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Supply"],
    }),
    getPurchaseOrderById: build.query<any, string>({
      query: (id) => `/purchase/order/${id}`,
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (result, error, id) => [{ type: "Supply", id }],
    }),
    createPurchaseOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/purchase/order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    updatePurchaseOrder: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/purchase/order/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    deletePurchaseOrder: build.mutation<any, string>({
      query: (id) => ({
        url: `/purchase/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supply"],
    }),
    sendPurchaseOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/purchase/order/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    confirmPurchaseOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/purchase/order/confirm",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    receivePurchaseOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/purchase/order/receive",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),
    cancelPurchaseOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/purchase/order/cancel",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),

    // ========== ANALYTICS API ENDPOINTS ==========
    getDashboardAnalytics: build.query<any, void>({
      query: () => "/analytics/revenue-reports",
      providesTags: ["Analytics"],
    }),
    getSalesAnalytics: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/revenue-reports",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getRevenueAnalytics: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/revenue-reports",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getCustomerAnalytics: build.query<any, void>({
      query: () => "/analytics/user-statistics",
      providesTags: ["Analytics"],
    }),
    getProductPerformance: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/kpi-metrics",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getInventoryAnalytics: build.query<any, void>({
      query: () => "/analytics/kpi-metrics",
      providesTags: ["Analytics"],
    }),
    getStaffPerformance: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/kpi-metrics",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),

    // ========== DELIVERY API ENDPOINTS ==========
    getAllDeliveries: build.query<any[], void>({
      query: () => "/delivery/deliveries",
      providesTags: ["Delivery"],
    }),
    getDeliveryById: build.query<any, string>({
      query: (id) => `/delivery/deliveries/${id}`,
      providesTags: ["Delivery"],
    }),
    createDelivery: build.mutation<any, any>({
      query: (data) => ({
        url: "/delivery/deliveries",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Delivery"],
    }),
    updateDelivery: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/delivery/deliveries/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Delivery"],
    }),
    updateDeliveryStatus: build.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/delivery/deliveries/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Delivery"],
    }),
    assignDeliveryDriver: build.mutation<any, { id: string; driverId: string }>({
      query: ({ id, driverId }) => ({
        url: `/delivery/deliveries/${id}`,
        method: "PUT",
        body: { deliveryStaffId: driverId },
      }),
      invalidatesTags: ["Delivery"],
    }),
    trackDelivery: build.query<any, string>({
      query: (trackingCode) => ({
        url: `/delivery/deliveries/tracking`,
        params: { trackingCode },
      }),
      providesTags: ["Delivery"],
    }),
    getDeliveryDrivers: build.query<any[], void>({
      query: () => "/delivery/delivery-staff",
      providesTags: ["Delivery"],
    }),

    // ========== FEEDBACK API ENDPOINTS ==========
    getAllFeedbacks: build.query<any[], void>({
      query: () => "/feedback/reviews",
      providesTags: ["Feedback"],
    }),
    getFeedbackById: build.query<any, string>({
      query: (id) => `/feedback/reviews/${id}`,
      providesTags: ["Feedback"],
    }),
    createFeedback: build.mutation<any, any>({
      query: (data) => ({
        url: "/feedback/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    updateFeedback: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/feedback/reviews/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    deleteFeedback: build.mutation<any, string>({
      query: (id) => ({
        url: `/feedback/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Feedback"],
    }),
    getRestaurantFeedbacks: build.query<any[], string>({
      query: (restaurantId) => ({
        url: `/feedback/reviews`,
        params: { restaurantId },
      }),
      providesTags: ["Feedback"],
    }),
    getMenuItemFeedbacks: build.query<any[], string>({
      query: (menuItemId) => ({
        url: `/feedback/reviews`,
        params: { menuItemId },
      }),
      providesTags: ["Feedback"],
    }),
    respondToFeedback: build.mutation<any, { id: string; response: string }>({
      query: ({ id, response }) => ({
        url: `/feedback/reviews/${id}/respond`,
        method: "POST",
        body: { response },
      }),
      invalidatesTags: ["Feedback"],
    }),

    // ========== FINANCE API ENDPOINTS ==========
    getAllTransactions: build.query<any[], void>({
      query: () => "/finance/transactions",
      providesTags: ["Finance"],
    }),
    getTransactionById: build.query<any, string>({
      query: (id) => `/finance/transactions/${id}`,
      providesTags: ["Finance"],
    }),
    createTransaction: build.mutation<any, any>({
      query: (data) => ({
        url: "/finance/transactions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Finance"],
    }),
    getFinancialReports: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/finance/reports",
        params: params ?? undefined,
      }),
      providesTags: ["Finance"],
    }),
    getRevenueSummary: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/finance/revenue-summary",
        params: params ?? undefined,
      }),
      providesTags: ["Finance"],
    }),
    getExpenseSummary: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/finance/expense-summary",
        params: params ?? undefined,
      }),
      providesTags: ["Finance"],
    }),
    getProfitMargin: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/finance/profit-margin",
        params: params ?? undefined,
      }),
      providesTags: ["Finance"],
    }),
    exportFinancialReport: build.mutation<any, { format: string; params?: any }>({
      query: ({ format, params }) => ({
        url: `/finance/export/${format}`,
        method: "POST",
        body: params,
      }),
    }),

    // ========== MARKETPLACE / CARTS ==========
    getCarts: build.query<
      CartWithItems[],
      {
        userId?: string;
        restaurantId?: string;
        hasItems?: boolean;
        isExpired?: boolean;
        page?: number;
        limit?: number;
        sortBy?: "createdAt" | "updatedAt" | "lastActivity" | "totalAmount";
        sortOrder?: "asc" | "desc";
      }
    >({
      query: (params) => {
        const queryParts: string[] = [];
        const addParam = (key: string, value: unknown) => {
          if (value === undefined || value === null || value === "") return;
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        };

        addParam("userId", params?.userId);
        addParam("restaurantId", params?.restaurantId);
        addParam("hasItems", params?.hasItems);
        addParam("isExpired", params?.isExpired);
        addParam("page", params?.page);
        addParam("limit", params?.limit);
        addParam("sortBy", params?.sortBy);
        addParam("sortOrder", params?.sortOrder);

        const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";

        return {
          url: `/marketplace/cart${queryString}`,
        };
      },
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Cart"],
    }),

    getCartById: build.query<CartWithItems, string>({
      query: (id) => `/marketplace/cart/${id}`,
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_result, _error, id) => [{ type: "Cart", id }],
    }),

    createCart: build.mutation<CartWithItems, { userId: string; restaurantId?: string | null }>({
      query: (data) => ({
        url: "/marketplace/cart",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["Cart"],
    }),

    addToCart: build.mutation<
      CartItem,
      {
        cartId: string;
        menuItemId?: string;
        retailProductId?: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        notes?: string | null;
        itemName?: string | null;
        itemImage?: string | null;
        specialInstructions?: string | null;
        isGift?: boolean;
        giftMessage?: string | null;
        userId?: string;
        restaurantId?: string;
      }
    >({
      query: (data) => ({
        url: "/marketplace/cart/item/add",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: build.mutation<
      CartItem,
      {
        id: string;
        quantity?: number;
        unitPrice?: number;
        totalPrice?: number;
        notes?: string | null;
        itemName?: string | null;
        itemImage?: string | null;
        specialInstructions?: string | null;
        isGift?: boolean;
        giftMessage?: string | null;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/marketplace/cart/item/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Cart", id }, "Cart"],
    }),

    deleteCartItem: build.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/marketplace/cart/item/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: build.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/marketplace/cart/${id}/clear`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // ========== MARKETPLACE API ENDPOINTS ==========
    getAllMarketplaceItems: build.query<any[], void>({
      query: () => "/marketplace/product/retail",
      providesTags: ["Marketplace"],
    }),
    getMarketplaceItemById: build.query<any, string>({
      query: (id) => `/marketplace/product/retail/${id}`,
      providesTags: ["Marketplace"],
    }),
    searchMarketplace: build.query<any[], Record<string, any>>({
      query: (params) => ({
        url: "/marketplace/product/retail",
        params,
      }),
      providesTags: ["Marketplace"],
    }),
    createMarketplaceListing: build.mutation<any, any>({
      query: (data) => ({
        url: "/marketplace/product/retail",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Marketplace"],
    }),
    updateMarketplaceListing: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/marketplace/product/retail/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Marketplace"],
    }),
    deleteMarketplaceListing: build.mutation<any, string>({
      query: (id) => ({
        url: `/marketplace/product/retail/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Marketplace"],
    }),
    getMyListings: build.query<any[], void>({
      query: () => "/marketplace/product/retail",
      providesTags: ["Marketplace"],
    }),
    getFeaturedListings: build.query<any[], void>({
      query: () => "/marketplace/product/retail",
      providesTags: ["Marketplace"],
    }),
    // ...



    // Payments (list, detail, update, refund) under /payment
    listPayments: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/payment`, params: params ?? {} }),
    }),
    createPaymentRecord: build.mutation<any, any>({
      query: (data) => ({ url: `/payment`, method: "POST", body: data }),
    }),
    paymentAnalytics: build.query<any, void>({ query: () => `/payment/summary` }),
    getPaymentDetail: build.query<any, string>({ query: (id) => `/payment/${id}` }),
    updatePaymentRecord: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/payment/${id}`, method: "PUT", body: data }),
    }),
    refundPayment: build.mutation<any, string>({
      query: (id) => ({ url: `/payment/refund`, method: "POST", body: { id } }),
    }),

    // ========== WALLET API ENDPOINTS ==========
    // Purchases (momo/zalopay/vnpay) under /wallet
    momoPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/momo`, method: "POST", body: data }),
    }),
    momoCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/momo/callback`, method: "POST", body: data }),
    }),
    momoTransactionStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/momo/status`, method: "POST", body: data }),
    }),
    zalopayPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/zalopay`, method: "POST", body: data }),
    }),
    zalopayCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/zalopay/callback`, method: "POST", body: data }),
    }),
    zalopayCheckStatus: build.mutation<any, string>({
      query: (id) => ({ url: `/wallet/zalopay/status/${id}`, method: "POST" }),
    }),
    vnpayPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/vnpay`, method: "POST", body: data }),
    }),
    vnpayCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/vnpay/callback`, method: "POST", body: data }),
    }),
    vnpayStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/vnpay/status`, method: "POST", body: data }),
    }),
    paypalPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/paypal`, method: "POST", body: data }),
    }),
    paypalCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/paypal/callback`, method: "POST", body: data }),
    }),
    paypalStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/wallet/paypal/status`, method: "POST", body: data }),
    }),

  }),
});

export const {
  // GraphQL API Hooks
  useGraphqlFirstQuery,
  useGraphqlSecondMutation,
  // useGraphqlSubscription,
  // useGraphqlInfiniteQuery,

  useCallbackMutation,
  useUploadMutation,

  // CRUD API Hooks
  // Users
  useGetMeQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  // Restaurants
  useGetAllRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,

  // Orders
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useGetCurrentOrderQuery,
  useGetRestaurantOrdersQuery,
  useGetPendingOrdersQuery,
  useGetRestaurantDashboardQuery,
  useGetOrderByCodeQuery,
  useCancelOrderMutation,

  // Categories
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateStatusCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteHardCategoryMutation,

  // Menus
  useGetAllMenusQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useGetAllMenuItemsQuery,
  useGetMenuItemsQuery,
  useGetMenuItemByIdQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useBulkUpdateMenuItemsMutation,
  useBulkToggleMenuItemsAvailabilityMutation,

  // Promotions & Vouchers
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,

  // Recipes
  useCreateRecipeMutation,
  useGetRecipesQuery,
  useCalculateRecipeCostMutation,
  useGetRecipeByIdQuery,
  useUpdateRecipeMutation,
  useGetRecipeByMenuItemIdQuery,

  // Ingredients
  useGetInventoryItemsQuery,
  useGetAllInventoryItemsQuery,
  useGetInventoryItemByIdQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,

  // Inventory Balance
  useGetInventoryBalancesQuery,
  useGetInventoryBalanceByIdQuery,
  useCreateInventoryBalanceMutation,
  useUpdateInventoryBalanceMutation,
  useDeleteInventoryBalanceMutation,

  // Warehouse
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,

  // Warehouse Receipt
  useGetWarehouseReceiptsQuery,
  useGetWarehouseReceiptByIdQuery,
  useCreateWarehouseReceiptMutation,
  useUpdateWarehouseReceiptMutation,
  useDeleteWarehouseReceiptMutation,

  // Warehouse Issue
  useGetWarehouseIssuesQuery,
  useGetWarehouseIssueByIdQuery,
  useCreateWarehouseIssueMutation,
  useUpdateWarehouseIssueMutation,
  useDeleteWarehouseIssueMutation,

  // Warehouse Transfer
  useGetWarehouseTransfersQuery,
  useGetWarehouseTransferByIdQuery,
  useCreateWarehouseTransferMutation,
  useUpdateWarehouseTransferMutation,
  useDeleteWarehouseTransferMutation,

  // Tables
  useGetAllTablesQuery,
  useGetTablesQuery,
  useGetTableByIdQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useGetTablesByRestaurantQuery,
  useUpdateTableStatusMutation,
  useCheckTableAvailabilityMutation,

  // Reservations
  useGetAllReservationsQuery,
  useUpdateStatusReservationMutation,
  useCreateReservationMutation,
  useGetReservationsQuery,
  useGetTodayReservationsQuery,
  useGetUpcomingReservationsQuery,
  useCheckAvailabilityMutation,
  useCreateWalkInMutation,
  useBulkUpdateReservationsMutation,
  useReservationAnalyticsMutation,
  useGetReservationByIdQuery,
  useUpdateReservationMutation,
  useUpdateReservationStatusMutation,
  useDeleteReservationMutation,

  // Notification API Hooks
  useGetAllNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,

  // Organization API Hooks
  useGetAllOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationMembersQuery,
  useGetOrganizationMembershipByIdQuery,
  useCreateOrganizationMembershipMutation,
  useUpdateOrganizationMembershipMutation,
  useDeleteOrganizationMembershipMutation,
  useBulkAddOrganizationMembersMutation,
  useBulkUpdateOrganizationMemberRolesMutation,
  useGetRestaurantChainsQuery,
  useGetRestaurantChainByIdQuery,
  useCreateRestaurantChainMutation,
  useUpdateRestaurantChainMutation,
  useDeleteRestaurantChainMutation,
  useGetRestaurantUserRolesQuery,
  useGetRestaurantUserRoleByIdQuery,
  useCreateRestaurantUserRoleMutation,
  useUpdateRestaurantUserRoleMutation,
  useDeleteRestaurantUserRoleMutation,
  useBulkAddRestaurantStaffMutation,
  useTransferRestaurantStaffMutation,
  useGetRestaurantStaffStatisticsQuery,

  // Supply API Hooks
  useGetAllSuppliesQuery,
  useGetSupplyByIdQuery,
  useCreateSupplyMutation,
  useUpdateSupplyMutation,
  useDeleteSupplyMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useRegisterSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useSendPurchaseOrderMutation,
  useConfirmPurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useCancelPurchaseOrderMutation,

  // Analytics API Hooks
  useGetDashboardAnalyticsQuery,
  useGetSalesAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetCustomerAnalyticsQuery,
  useGetProductPerformanceQuery,
  useGetInventoryAnalyticsQuery,
  useGetStaffPerformanceQuery,
  useGetOrderStatsQuery,
  useGetOrderAnalyticsQuery,

  // Delivery API Hooks
  useGetAllDeliveriesQuery,
  useGetDeliveryByIdQuery,
  useCreateDeliveryMutation,
  useUpdateDeliveryMutation,
  useUpdateDeliveryStatusMutation,
  useAssignDeliveryDriverMutation,
  useTrackDeliveryQuery,
  useGetDeliveryDriversQuery,

  // Feedback API Hooks
  useGetAllFeedbacksQuery,
  useGetFeedbackByIdQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetRestaurantFeedbacksQuery,
  useGetMenuItemFeedbacksQuery,
  useRespondToFeedbackMutation,

  // Finance API Hooks
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useGetFinancialReportsQuery,
  useGetRevenueSummaryQuery,
  useGetExpenseSummaryQuery,
  useGetProfitMarginQuery,
  useExportFinancialReportMutation,

  // Cart API Hooks
  useGetCartsQuery,
  useLazyGetCartsQuery,
  useGetCartByIdQuery,
  useLazyGetCartByIdQuery,
  useCreateCartMutation,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  useClearCartMutation,

  // Marketplace API Hooks
  useGetAllMarketplaceItemsQuery,
  useGetMarketplaceItemByIdQuery,
  useSearchMarketplaceQuery,
  useCreateMarketplaceListingMutation,
  useUpdateMarketplaceListingMutation,
  useDeleteMarketplaceListingMutation,
  useGetMyListingsQuery,
  useGetFeaturedListingsQuery,

  // useUpdateUserMutation,
  // useCreateCourseMutation,
  // useUpdateCourseMutation,
  // useDeleteCourseMutation,
  // useGetCoursesQuery,
  // useGetCourseQuery,
  // useGetUploadVideoUrlMutation,
  // useGetTransactionsQuery,
  // useCreateTransactionMutation,
  // useCreateStripePaymentIntentMutation,
  // useGetUserEnrolledCoursesQuery,
  // useGetUserCourseProgressQuery,
  // useUpdateUserCourseProgressMutation,
} = api;
