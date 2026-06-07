export { ApiError } from "./client/core/ApiError"
export {
  CancelablePromise,
  CancelError,
} from "./client/core/CancelablePromise"
export { OpenAPI, type OpenAPIConfig } from "./client/core/OpenAPI"

import {
  AdminService,
  AuthService,
  CategoriesService,
  ChatsService,
  DefaultService,
  EscrowService,
  UsersService as GeneratedUsersService,
  ListingsService,
  NotificationsService,
  OffersService,
  OrdersService,
  ReviewsService,
  UtilsService,
  WalletService,
  ShippingService,
  ReturnsService,
} from "./client/sdk.gen"

export * from "./client/types.gen"
export {
  AdminService,
  AuthService,
  CategoriesService,
  ChatsService,
  DefaultService,
  EscrowService,
  ListingsService,
  NotificationsService,
  OffersService,
  OrdersService,
  ReviewsService,
  UtilsService,
  WalletService,
  ShippingService,
  ReturnsService,
}

import type {
  Body_login_api_v1_auth_login_post,
  ChangePasswordRequest,
  ListingCreate,
  ListingRead,
  ListingUpdate,
  UserRegister,
  UserUpdate,
} from "./client/types.gen"

export type Body_login_login_access_token = Body_login_api_v1_auth_login_post

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserUpdateMe = UserUpdate & {
  email?: string
}

export type UserCreate = UserRegister & {
  is_superuser?: boolean
  is_active?: boolean
}

export type ItemCreate = {
  title: string
  description?: string | null
}

export type ItemUpdate = {
  title?: string | null
  description?: string | null
}

export type ItemPublic = {
  id: string
  owner_id: string
  title: string
  description?: string | null
  created_at?: string | null
}

export type ItemsPublic = {
  data: Array<ItemPublic>
  count: number
}

const mapListingToItem = (listing: ListingRead): ItemPublic => ({
  id: listing.id,
  owner_id: listing.seller_id,
  title: listing.title,
  description: listing.description,
  created_at: listing.created_at,
})

export class LoginService {
  public static loginAccessToken(data: {
    formData: Body_login_login_access_token
  }) {
    return AuthService.loginApiV1AuthLoginPost(data)
  }

  public static recoverPassword(data: { email: string }) {
    return AuthService.forgotPasswordApiV1AuthForgotPasswordPost({
      requestBody: { email: data.email },
    })
  }

  public static resetPassword(data: {
    requestBody: { token: string; new_password: string }
  }) {
    return AuthService.resetPasswordApiV1AuthResetPasswordPost(data)
  }
}

export class UsersService {
  public static readUserMe() {
    return GeneratedUsersService.getCurrentUserInfoApiV1UsersMeGet()
  }

  public static readUserPublicProfile(data: { userId: string }) {
    return GeneratedUsersService.getUserProfileApiV1UsersUserIdGet({
      userId: data.userId,
    })
  }

  public static registerUser(data: { requestBody: UserRegister }) {
    return AuthService.registerApiV1AuthRegisterPost(data)
  }

  public static readUsers(data: { skip?: number; limit?: number } = {}) {
    return AdminService.listUsersApiV1AdminUsersGet(data).then((users) => ({
      data: users as Array<any>,
      count: users.length,
    }))
  }

  public static updateUserMe(data: { requestBody: UserUpdateMe }) {
    const { email: _ignoredEmail, ...rest } = data.requestBody
    return GeneratedUsersService.updateMyProfileApiV1UsersMePut({
      requestBody: rest,
    })
  }

  public static updatePasswordMe(data: { requestBody: UpdatePassword }) {
    return GeneratedUsersService.changePasswordApiV1UsersMePasswordPut({
      requestBody: {
        current_password: data.requestBody.current_password,
        new_password: data.requestBody.new_password,
        confirm_password: data.requestBody.new_password,
      } as ChangePasswordRequest,
    })
  }

  public static updateUser(data: { userId: string; requestBody: any }) {
    if (typeof data.requestBody?.is_active === "boolean") {
      return AdminService.updateUserAccountStatusApiV1AdminUsersUserIdStatusPatch(
        {
          userId: data.userId,
          requestBody: { is_active: data.requestBody.is_active },
        },
      )
    }

    return Promise.resolve({ id: data.userId, ...data.requestBody } as any)
  }

  public static createUser(data: { requestBody: UserCreate }) {
    return AuthService.registerApiV1AuthRegisterPost({
      requestBody: {
        email: data.requestBody.email,
        full_name: data.requestBody.full_name,
        password: data.requestBody.password,
        phone: data.requestBody.phone,
      },
    })
  }

  public static deleteUserMe() {
    return Promise.resolve({
      message: "Not supported by current backend contract",
    } as any)
  }

  public static deleteUser(_data: { userId: string }) {
    return Promise.resolve({
      message: "Not supported by current backend contract",
    } as any)
  }
}

export class ItemsService {
  public static async readItems(
    data: { skip?: number; limit?: number } = {},
  ): Promise<ItemsPublic> {
    const response = await ListingsService.listListingsApiV1ListingsGet(data)
    const items = (response.items ?? []).map(mapListingToItem)
    return {
      data: items,
      count: response.total,
    }
  }

  public static async readItem(data: { id: string }): Promise<ItemPublic> {
    const listing = await ListingsService.getListingApiV1ListingsListingIdGet({
      listingId: data.id,
    })
    return mapListingToItem(listing)
  }

  public static async createItem(data: {
    requestBody: ItemCreate
  }): Promise<ItemPublic> {
    const listingData: ListingCreate = {
      title: data.requestBody.title,
      description: data.requestBody.description ?? null,
      price: 100,
      is_negotiable: true,
      condition_grade: "good",
      category_id: "00000000-0000-0000-0000-000000000000",
    }

    const created = await ListingsService.createListingApiV1ListingsPost({
      requestBody: listingData,
    })
    return mapListingToItem(created)
  }

  public static async updateItem(data: {
    id: string
    requestBody: ItemUpdate
  }): Promise<ItemPublic> {
    const patchData: ListingUpdate = {
      title: data.requestBody.title ?? null,
      description: data.requestBody.description ?? null,
    }
    const updated =
      await ListingsService.updateListingApiV1ListingsListingIdPatch({
        listingId: data.id,
        requestBody: patchData,
      })
    return mapListingToItem(updated)
  }

  public static deleteItem(data: { id: string }) {
    return ListingsService.deleteListingApiV1ListingsListingIdDelete({
      listingId: data.id,
    })
  }
}
