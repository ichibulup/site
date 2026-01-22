import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import {
  CategoryDataColumn,
  IngredientDataColumn,
  MenuDataColumn,
  MenuItemDataColumn,
  RecipeDataColumn,
  ReservationDataColumn,
  ReservationStatus,
  TableDataColumn
} from "@/lib/interfaces";

const baseQueryWithAuth: BaseQueryFn<
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
  baseQuery: baseQueryWithAuth,
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
    "Notification",
    "Organization",
    "Supply",
    "Wallet"
  ],
  endpoints: (build) => ({
    // ========== AUTHENTICATION API ENDPOINTS ==========
    sync: build.mutation<any, void>({
      query: (data) => ({
        url: "/user/sync",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    // Login
    login: build.mutation<any, { identifier: string; password: string; remember_me?: boolean }>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    oauth: build.mutation<any, any>({
      query: () => ({
        url: "/auth/oauth/callback",
        method: "POST",
      })
    }),

    // Register
    register: build.mutation<any, {
      firstName: string;
      lastName: string;
      username?: string;
      email: string;
      password: string;
      confirmPassword: string;
      phoneNumber?: string;
      phoneCode?: string;
      termsAccepted: boolean;
      newsletterSubscription?: boolean;
    }>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: {
          email: data.email,
          password: data.password,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          metadata: {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            phoneNumber: data.phoneNumber,
            phoneCode: data.phoneCode,
            newsletterSubscription: data.newsletterSubscription
          }
        },
      }),
      invalidatesTags: ["Auth"],
    }),

    // Logout
    logout: build.mutation<any, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    // Get current user
    getMe: build.query<any, void>({
      query: () => "/auth/me",
      providesTags: ["Auth", "User"],
    }),

    // Forgot password
    forgotPassword: build.mutation<any, { email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // Reset password
    resetPassword: build.mutation<any, { token: string; newPassword: string; confirmPassword: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // Change password
    changePassword: build.mutation<any, { currentPassword: string; newPassword: string; confirmNewPassword: string }>({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),

    // Verify email
    verifyEmail: build.mutation<any, {
      email?: string;
      token?: string;
      token_hash?: string;
      access_token?: string;
      refresh_token?: string;
      type: string
    }>({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Resend verification email
    resendVerificationEmail: build.mutation<any, void>({
      query: () => ({
        url: "/auth/resend-verification",
        method: "POST",
      }),
    }),

    // OAuth login
    oauthLogin: build.mutation<any, { provider: string; code?: string; state?: string; session?: any; user?: any }>({
      query: (data) => ({
        url: "/auth/oauth",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Sync user from Supabase
    syncUser: build.mutation<any, { user: any; session: any }>({
      query: (data) => ({
        url: "/auth/sync-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Update profile
    updateProfile: build.mutation<any, {
      firstName?: string;
      lastName?: string;
      username?: string;
      email?: string;
      phoneNumber?: string;
      phoneCode?: string;
      bio?: string;
      dateOfBirth?: string;
      gender?: string;
      avatarUrl?: string;
      coverUrl?: string;
    }>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    // Get user sessions
    getUserSessions: build.query<any[], void>({
      query: () => "/auth/sessions",
      providesTags: ["Auth"],
    }),

    // Revoke session
    revokeSession: build.mutation<any, { sessionId: string }>({
      query: (data) => ({
        url: "/auth/sessions/revoke",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Revoke all sessions
    revokeAllSessions: build.mutation<any, void>({
      query: () => ({
        url: "/auth/sessions/revoke-all",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

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

    // ========== JAPTOR API ENDPOINTS ==========
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
    // ========== JAPTOR API ENDPOINTS ==========
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
        url: `/recipe/menu-item/${id}`
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
      query: (data) => ({ url: `/inventory/item/bulk-update`, method: "PATCH", body: data }),
    }),
    getLowStockAlert: build.query<any, void>({ query: () => `/inventory/item/low-stock-alert` }),
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
      query: (restaurantId) => `/restaurant/${restaurantId}/inventory-items`,
    }),
    createInventoryTransaction: build.mutation<any, any>({
      query: (data) => ({ url: `/inventory-transactions`, method: "POST", body: data }),
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
      query: (params) => ({ url: `/inventory-transactions`, params: params ?? {} }),
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
    getAllUsers: build.query<any[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
    getUserById: build.query<any, string>({
      query: (id) => `/user/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: build.mutation<any, any>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
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
    getAllOrders: build.query<any[], void>({
      query: () => "/order",
      providesTags: ["Order"],
    }),
    getOrderById: build.query<any, string>({
      query: (id) => `/order/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/orders",
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
      query: () => `/order/stats`,
      providesTags: ["Order"],
    }),
    getOrderAnalytics: build.query<any, void>({
      query: () => `/order/analytics`,
      providesTags: ["Order"],
    }),
    getMyOrders: build.query<any[], void>({
      query: () => `/order/my-order`,
      providesTags: ["Order"],
    }),
    getCurrentOrder: build.query<any, void>({
      query: () => `/order/current`,
      providesTags: ["Order"],
    }),
    getRestaurantOrders: build.query<any[], void>({
      query: () => `/order/restaurant`,
      providesTags: ["Order"],
    }),
    getPendingOrders: build.query<any[], void>({
      query: () => `/order/restaurant/pending`,
      providesTags: ["Order"],
    }),
    getRestaurantDashboard: build.query<any, void>({
      query: () => `/order/restaurant/dashboard`,
      providesTags: ["Order"],
    }),
    getOrderByCode: build.query<any, string>({
      query: (orderCode) => `/order/code/${orderCode}`,
      providesTags: ["Order"],
    }),
    cancelOrder: build.mutation<any, string>({
      query: (id) => ({ url: `/order/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Order"],
    }),
    bulkOrderActions: build.mutation<any, any>({
      query: (data) => ({ url: `/order/bulk-actions`, method: "POST", body: data }),
      invalidatesTags: ["Order"],
    }),
    getKitchenOrders: build.query<any[], void>({
      query: () => `/order/kitchen/orders`,
      providesTags: ["Order"],
    }),
    updateCookingStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/order/kitchen/cooking-status`, method: "PUT", body: data }),
      invalidatesTags: ["Order"],
    }),

    // Voucher
    createVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/voucher`, method: "POST", body: data }),
      invalidatesTags: ["Menu"],
    }),
    getVouchers: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/voucher`, params: params ?? {} }),
    }),
    getVoucherById: build.query<any, string>({ query: (id) => `/voucher/${id}` }),
    getVoucherByCode: build.query<any, string>({ query: (code) => `/voucher/code/${code}` }),
    updateVoucher: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/voucher/${id}`, method: "PUT", body: data }),
    }),
    deleteVoucher: build.mutation<any, string>({
      query: (id) => ({ url: `/voucher/${id}`, method: "DELETE" }),
    }),
    hardDeleteVoucher: build.mutation<any, string>({
      query: (id) => ({ url: `/voucher/${id}/hard`, method: "DELETE" }),
    }),
    validateVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/voucher/validate`, method: "POST", body: data }),
    }),
    useVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/voucher/use`, method: "POST", body: data }),
    }),
    getVoucherUsageHistory: build.query<any, string>({
      query: (id) => `/voucher/${id}/usage`,
    }),
    getActiveVouchersForRestaurant: build.query<any, string>({
      query: (restaurantId) => `/voucher/restaurant/${restaurantId}/active`,
    }),

    // Promotions bundle (mounted under /payment)
    promotionCreateVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/vouchers`, method: "POST", body: data }),
    }),
    promotionGetVouchers: build.query<any, void>({ query: () => `/payment/vouchers` }),
    promotionUpdateVoucher: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/payment/vouchers/${id}`, method: "PUT", body: data }),
    }),
    promotionDeleteVoucher: build.mutation<any, string>({
      query: (id) => ({ url: `/payment/vouchers/${id}`, method: "DELETE" }),
    }),
    promotionApplyVoucher: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/vouchers/apply`, method: "POST", body: data }),
    }),
    promotionGetMyVouchers: build.query<any, void>({ query: () => `/payment/my-vouchers` }),
    promotionCreatePromotion: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/promotions`, method: "POST", body: data }),
    }),
    promotionGetPromotions: build.query<any, void>({ query: () => `/payment/promotions` }),
    promotionUpdatePromotion: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/payment/promotions/${id}`, method: "PUT", body: data }),
    }),
    promotionDeletePromotion: build.mutation<any, string>({
      query: (id) => ({ url: `/payment/promotions/${id}`, method: "DELETE" }),
    }),
    promotionCheckPromotions: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/promotions/check`, method: "POST", body: data }),
    }),
    promotionGetMyPromotions: build.query<any, void>({ query: () => `/payment/my-promotions` }),
    promotionCalculateBestDiscount: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/calculate-discount`, method: "POST", body: data }),
    }),
    promotionGetAnalytics: build.query<any, void>({ query: () => `/payment/analytics` }),
    promotionGetRestaurantVouchers: build.query<any, string>({
      query: (restaurantId) => `/payment/restaurant/${restaurantId}/vouchers`,
    }),
    promotionGetRestaurantPromotions: build.query<any, string>({
      query: (restaurantId) => `/payment/restaurant/${restaurantId}/promotions`,
    }),

    // Payments (list, detail, update, refund) under /payment
    listPayments: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/payment`, params: params ?? {} }),
    }),
    createPaymentRecord: build.mutation<any, any>({
      query: (data) => ({ url: `/payment`, method: "POST", body: data }),
    }),
    paymentAnalytics: build.query<any, void>({ query: () => `/payment/analytics` }),
    getPaymentDetail: build.query<any, string>({ query: (id) => `/payment/${id}` }),
    updatePaymentRecord: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/payment/${id}`, method: "PUT", body: data }),
    }),
    refundPayment: build.mutation<any, string>({
      query: (id) => ({ url: `/payment/${id}/refund`, method: "POST" }),
    }),

    // Purchases (momo/zalopay/vnpay) under /payment
    momoPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/momo`, method: "POST", body: data }),
    }),
    momoCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/momo/callback`, method: "POST", body: data }),
    }),
    momoTransactionStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/momo/transaction-status`, method: "POST", body: data }),
    }),
    zalopayPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/zalopay`, method: "POST", body: data }),
    }),
    zalopayCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/zalopay/callback`, method: "POST", body: data }),
    }),
    zalopayCheckStatus: build.mutation<any, string>({
      query: (id) => ({ url: `/payment/zalopay/check-status/${id}`, method: "POST" }),
    }),
    vnpayPayment: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/vnpay`, method: "POST", body: data }),
    }),
    vnpayCallback: build.mutation<any, any>({
      query: (data) => ({ url: `/payment/vnpay/callback`, method: "POST", body: data }),
    }),
    // ///////////////////////
    createRecipe: build.mutation<any, any>({
      query: (data) => ({ url: `/recipes`, method: "POST", body: data }),
    }),
    getRecipes: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: `/recipes`, params: params ?? {} }),
    }),
    calculateRecipeCost: build.mutation<any, any>({
      query: (data) => ({ url: `/recipes/calculate-cost`, method: "POST", body: data }),
    }),
    getRecipeById: build.query<any, string>({ query: (id) => `/recipes/${id}` }),
    updateRecipe: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/recipes/${id}`, method: "PUT", body: data }),
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
      query: (restaurantId) => `/restaurant/table/restaurant/${restaurantId}`,
    }),
    updateTableStatus: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/table/status`, method: "PUT", body: data }),
    }),
    checkTableAvailability: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/table/availability`, method: "POST", body: data }),
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
        method: "PATCH",
        body: status,
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
    getTodayReservations: build.query<any, void>({ query: () => `/restaurant/reservation/today` }),
    getUpcomingReservations: build.query<any, void>({ query: () => `/restaurant/reservation/upcoming` }),
    checkAvailability: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation/check-availability`, method: "POST", body: data }),
    }),
    createWalkIn: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation/walk-in`, method: "POST", body: data }),
    }),
    bulkUpdateReservations: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation/bulk-update`, method: "PATCH", body: data }),
    }),
    reservationAnalytics: build.mutation<any, any>({
      query: (data) => ({ url: `/restaurant/reservation/analytics`, method: "POST", body: data }),
    }),
    getReservationById: build.query<any, string>({ query: (id) => `/restaurant/reservation/${id}` }),
    updateReservation: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/restaurant/reservation/${id}`, method: "PUT", body: data }),
    }),
    updateReservationStatus: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/restaurant/reservation/${id}/status`, method: "PATCH", body: data }),
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
      query: (formData) => ({ url: `/upload/avatar`, method: "POST", body: formData }),
    }),
    uploadFile: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload`, method: "POST", body: formData }),
    }),
    uploadMultipleFiles: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/multiple`, method: "POST", body: formData }),
    }),
    uploadCategoryImage: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/images/categories`, method: "POST", body: formData }),
    }),
    uploadMenuImage: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/images/menus`, method: "POST", body: formData }),
    }),
    uploadMenuItemImage: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/images/menu-items`, method: "POST", body: formData }),
    }),
    uploadRestaurantLogo: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/images/restaurant/logo`, method: "POST", body: formData }),
    }),
    uploadRestaurantCover: build.mutation<any, FormData>({
      query: (formData) => ({ url: `/upload/images/restaurant/cover`, method: "POST", body: formData }),
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
      query: () => "/notification",
      providesTags: ["Notification"],
    }),
    getNotificationById: build.query<any, string>({
      query: (id) => `/notification/${id}`,
      providesTags: ["Notification"],
    }),
    getMyNotifications: build.query<any[], void>({
      query: () => "/notification/me",
      providesTags: ["Notification"],
    }),
    markNotificationAsRead: build.mutation<any, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsAsRead: build.mutation<any, void>({
      query: () => ({
        url: "/notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: build.mutation<any, string>({
      query: (id) => ({
        url: `/notification/${id}`,
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
    getOrganizationMembers: build.query<any[], string>({
      query: (id) => `/organization/${id}/members`,
      providesTags: ["Organization"],
    }),
    addOrganizationMember: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/organization/${id}/member`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
    removeOrganizationMember: build.mutation<any, { orgId: string; memberId: string }>({
      query: ({ orgId, memberId }) => ({
        url: `/organization/${orgId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
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
    getSuppliers: build.query<any[], void>({
      query: () => "/supplies/suppliers",
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
    getPurchaseOrders: build.query<any[], void>({
      query: () => "/supply/purchase-orders",
      providesTags: ["Supply"],
    }),
    createPurchaseOrder: build.mutation<any, any>({
      query: (data) => ({
        url: "/supply/purchase-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Supply"],
    }),

    // ========== ANALYTICS API ENDPOINTS ==========
    getDashboardAnalytics: build.query<any, void>({
      query: () => "/analytics/dashboard",
      providesTags: ["Analytics"],
    }),
    getSalesAnalytics: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/sales",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getRevenueAnalytics: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/revenue",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getCustomerAnalytics: build.query<any, void>({
      query: () => "/analytics/customers",
      providesTags: ["Analytics"],
    }),
    getProductPerformance: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/product-performance",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getInventoryAnalytics: build.query<any, void>({
      query: () => "/analytics/inventory",
      providesTags: ["Analytics"],
    }),
    getStaffPerformance: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/analytics/staff-performance",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),

    // ========== DELIVERY API ENDPOINTS ==========
    getAllDeliveries: build.query<any[], void>({
      query: () => "/delivery",
      providesTags: ["Delivery"],
    }),
    getDeliveryById: build.query<any, string>({
      query: (id) => `/delivery/${id}`,
      providesTags: ["Delivery"],
    }),
    createDelivery: build.mutation<any, any>({
      query: (data) => ({
        url: "/delivery",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Delivery"],
    }),
    updateDelivery: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/delivery/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Delivery"],
    }),
    updateDeliveryStatus: build.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/delivery/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Delivery"],
    }),
    assignDeliveryDriver: build.mutation<any, { id: string; driverId: string }>({
      query: ({ id, driverId }) => ({
        url: `/delivery/${id}/assign`,
        method: "PATCH",
        body: { driverId },
      }),
      invalidatesTags: ["Delivery"],
    }),
    trackDelivery: build.query<any, string>({
      query: (id) => `/delivery/${id}/track`,
      providesTags: ["Delivery"],
    }),
    getDeliveryDrivers: build.query<any[], void>({
      query: () => "/delivery/drivers",
      providesTags: ["Delivery"],
    }),

    // ========== FEEDBACK API ENDPOINTS ==========
    getAllFeedbacks: build.query<any[], void>({
      query: () => "/feedbacks",
      providesTags: ["Feedback"],
    }),
    getFeedbackById: build.query<any, string>({
      query: (id) => `/feedbacks/${id}`,
      providesTags: ["Feedback"],
    }),
    createFeedback: build.mutation<any, any>({
      query: (data) => ({
        url: "/feedbacks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    updateFeedback: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/feedbacks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    deleteFeedback: build.mutation<any, string>({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Feedback"],
    }),
    getRestaurantFeedbacks: build.query<any[], string>({
      query: (restaurantId) => `/feedbacks/restaurant/${restaurantId}`,
      providesTags: ["Feedback"],
    }),
    getMenuItemFeedbacks: build.query<any[], string>({
      query: (menuItemId) => `/feedbacks/menu-item/${menuItemId}`,
      providesTags: ["Feedback"],
    }),
    respondToFeedback: build.mutation<any, { id: string; response: string }>({
      query: ({ id, response }) => ({
        url: `/feedbacks/${id}/respond`,
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

    // ========== MARKETPLACE API ENDPOINTS ==========
    getAllMarketplaceItems: build.query<any[], void>({
      query: () => "/marketplace",
      providesTags: ["Marketplace"],
    }),
    getMarketplaceItemById: build.query<any, string>({
      query: (id) => `/marketplace/${id}`,
      providesTags: ["Marketplace"],
    }),
    searchMarketplace: build.query<any[], Record<string, any>>({
      query: (params) => ({
        url: "/marketplace/search",
        params,
      }),
      providesTags: ["Marketplace"],
    }),
    createMarketplaceListing: build.mutation<any, any>({
      query: (data) => ({
        url: "/marketplace/listings",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Marketplace"],
    }),
    updateMarketplaceListing: build.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/marketplace/listings/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Marketplace"],
    }),
    deleteMarketplaceListing: build.mutation<any, string>({
      query: (id) => ({
        url: `/marketplace/listings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Marketplace"],
    }),
    getMyListings: build.query<any[], void>({
      query: () => "/marketplace/my-listings",
      providesTags: ["Marketplace"],
    }),
    getFeaturedListings: build.query<any[], void>({
      query: () => "/marketplace/featured",
      providesTags: ["Marketplace"],
    }),

  }),
});

export const {
  // Authentication API Hooks
  useOauthMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useOauthLoginMutation,
  useSyncUserMutation,
  useUpdateProfileMutation,
  useGetUserSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,

  // GraphQL API Hooks
  useGraphqlFirstQuery,
  useGraphqlSecondMutation,
  // useGraphqlSubscription,
  // useGraphqlInfiniteQuery,

  useUploadMutation,

  // CRUD API Hooks
  // Users
  useSyncMutation,
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
  useAddOrganizationMemberMutation,
  useRemoveOrganizationMemberMutation,

  // Supply API Hooks
  useGetAllSuppliesQuery,
  useGetSupplyByIdQuery,
  useCreateSupplyMutation,
  useUpdateSupplyMutation,
  useDeleteSupplyMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,

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


// export interface Product {
//     productId: string;
//     name: string;
//     price: number;
//     rating?: number;
//     stockQuantity: number;
// }
//
// export interface NewProduct {
//     name: string;
//     price: number;
//     rating?: number;
//     stockQuantity: number;
// }
//
// export interface SalesSummary {
//     salesSummaryId: string;
//     totalValue: number;
//     changePercentage?: number;
//     date: string;
// }
//
// export interface PurchaseSummary {
//     purchaseSummaryId: string;
//     totalPurchased: number;
//     changePercentage?: number;
//     date: string;
// }
//
// export interface ExpenseSummary {
//     expenseSummaryId: string;
//     totalExpenses: number;
//     date: string;
// }
//
// export interface ExpenseByCategorySummary {
//     expenseByCategorySummaryId: string;
//     category: string;
//     amount: string;
//     date: string;
// }
//
// export interface DashboardMetrics {
//     popularProducts: Product[];
//     salesSummary: SalesSummary[];
//     purchaseSummary: PurchaseSummary[];
//     expenseSummary: ExpenseSummary[];
//     expenseByCategorySummary: ExpenseByCategorySummary[];
// }
//
// export interface User {
//     userId: string;
//     name: string;
//     email: string;
// }
//
// export const api = createApi({
//     baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
//     reducerPath: "api",
//     tagTypes: ["Users", "DashboardMetrics", "Products", "Expenses"],
//     endpoints: (build) => ({
//         getUsers: build.query<User[], void>({
//             query: (id) => `/users/${id}`,
//             providesTags: ["Users"],
//         }),
//         getDashboardMetrics: build.query<DashboardMetrics, void>({
//             query: () => "/dashboard",
//             providesTags: ["DashboardMetrics"],
//         }),
//         getProducts: build.query<Product[], string | void>({
//             query: (search) => ({
//                 url: "/products",
//                 params: search ? { search } : {},
//             }),
//             providesTags: ["Products"],
//         }),
//         createProduct: build.mutation<Product, NewProduct>({
//             query: (newProduct) => ({
//                 url: "/products",
//                 method: "POST",
//                 body: newProduct,
//             }),
//             invalidatesTags: ["Products"],
//         }),
//         getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
//             query: () => "/expenses",
//             providesTags: ["Expenses"],
//         }),
//     }),
// });
//
// export const {
//     useGetDashboardMetricsQuery,
//     useGetProductsQuery,
//     useCreateProductMutation,
//     useGetUsersQuery,
//     useGetExpensesByCategoryQuery,
// } = api;
