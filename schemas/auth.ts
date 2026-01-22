import { z } from "zod";

// === PHONE NUMBER VALIDATION FOR VIETNAM ===
const VIETNAM_PHONE_REGEX = /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-46-9])[0-9]{7}$/;

// Transform function để clean phone number
const cleanVietnamesePhone = (phone: string): string => {
  // Remove all non-digits and +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Convert +84 to 0
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.slice(2);
  }

  return cleaned;
};

export const providerEnum = z.enum(["google", "facebook"]);
export type OAuthProvider = z.infer<typeof providerEnum>;

export const registerSchema = z.object({
  email: z.string()
    .email('Email không hợp lệ')
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .toLowerCase()
    .trim(),
  username: z.string()
    .min(5, 'Tên đăng nhập phải có ít nhất 5 ký tự')
    .max(30, 'Tên đăng nhập không được vượt quá 30 ký tự')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang')
    .toLowerCase()
    .trim(),
  firstName: z.string()
    .min(1, 'Tên phải có ít nhất 1 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng')
    .trim(),
  lastName: z.string()
    .min(1, 'Họ phải có ít nhất 1 ký tự')
    .max(50, 'Họ không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ chỉ được chứa chữ cái và khoảng trắng')
    .trim(),
  phoneCode: z.string().min(1).default('+84').optional(),
  phoneNumber: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được vượt quá 15 số')
    .transform(cleanVietnamesePhone)
    .refine(
      (phone) => VIETNAM_PHONE_REGEX.test(phone),
      'Số điện thoại không hợp lệ (chỉ hỗ trợ số Việt Nam)'
    ),
  // avatarUrl: z.string(),
  // dateOfBirth: z.string(),
  // gender: z.string(),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Mật khẩu phải chứa ít nhất: 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  confirmPassword: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Mật khẩu phải chứa ít nhất: 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  termsAccepted: z.boolean(),
  redirectTo: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Xác nhận mật khẩu không khớp",
  path: ["confirmPassword"]
});
export type RegisterInput = z.infer<typeof registerSchema>;
// export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string()
    .min(5, 'Ít nhất 5 ký tự')
    .max(255, 'Tối đa 255 ký tự')
    .trim()
    .lowercase()
    .refine(val => {
      // Cho phép: email hợp lệ hoặc username hợp lệ
      const isEmail = /@/.test(val) && /.+@.+\..+/.test(val);
      const isUsername = /^[a-zA-Z0-9_.-]{3,30}$/.test(val);
      return isEmail || isUsername;
    }, 'Phải là email hoặc username hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu không được để trống')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự'),
  remember: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;
// export type LoginInput = z.infer<typeof loginSchema>;

export const logoutSchema = z.object({
  accessToken: z.string().min(10).optional(),
  scope: z.enum(["global", "local"]).optional(),
});
// export type LogoutInput = z.infer<typeof logoutSchema>;

export const forgotSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url().optional(),
});
// export type ForgotInput = z.infer<typeof forgotSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email không hợp lệ')
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .toLowerCase()
    .trim()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  newPassword: z.string()
    .email('Email không hợp lệ')
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .toLowerCase()
    .trim(),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Xác nhận mật khẩu không khớp",
  path: ["confirmPassword"]
});

export const resetSchema = z.object({
  // code: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});
export type ResetPasswordInput = z.infer<typeof resetSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6),
  type: z.enum(["email", "recovery", "invite", "email_change"]).default("email"),
});

export const verifyEmailHashSchema = z.object({
  token_hash: z.string().min(1),
  type: z.enum(["email", "recovery", "invite", "email_change"]).default("email"),
});

export const verifyEmailAccessTokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  type: z.enum(["email", "recovery", "invite", "email_change"]).default("email"),
});

// Combined schema for all verification methods
export const verifyEmailCombinedSchema = z.union([
  verifyEmailSchema,
  verifyEmailHashSchema,
  verifyEmailAccessTokenSchema
]);

// export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const startOAuthSchema = z.object({
  provider: providerEnum,
  redirectTo: z.string().url(),
  scopes: z.string().optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
});
// export type StartOAuthInput = z.infer<typeof startOAuthSchema>;

export const oauthCallbackSchema = z.object({
  code: z.string().min(6),
});
// export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;

export const sessionFromCookiesSchema = z.object({
  accessToken: z.string().min(10).optional(),
  refreshToken: z.string().min(10).optional(),
});
// export type SessionFromCookiesInput = z.infer<typeof sessionFromCookiesSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(8, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z.string()
    .min(12, 'Mật khẩu phải có ít nhất 12 ký tự')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Mật khẩu phải chứa ít nhất: 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Xác nhận mật khẩu mới không khớp",
  path: ["confirmNewPassword"],
});

export const oauthLoginSchema = z.object({
  provider: z.string().min(1),
  code: z.string().optional(),
  state: z.string().optional(),
  session: z.any().optional(),
  user: z.any().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'Tên phải có ít nhất 1 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng')
    .trim().optional(),
  lastName: z.string()
    .min(1, 'Tên phải có ít nhất 1 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng')
    .trim().optional(),
  username: z.string()
    .min(5, 'Tên đăng nhập phải có ít nhất 5 ký tự')
    .max(30, 'Tên đăng nhập không được vượt quá 30 ký tự')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang')
    .toLowerCase()
    .trim().optional(),
  email: z.string()
    .email('Email không hợp lệ')
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .toLowerCase()
    .trim().optional(),
  phoneNumber: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được vượt quá 15 số')
    .transform(cleanVietnamesePhone)
    .refine(
      (phone) => VIETNAM_PHONE_REGEX.test(phone),
      'Số điện thoại không hợp lệ (chỉ hỗ trợ số Việt Nam)'
    ).optional(),
  phoneCode: z.string().min(1).default('+84'),
  bio: z.string()
    .max(500, 'Tiểu sử không được vượt quá 500 ký tự')
    .optional(),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD')
    .optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  avatarUrl: z.string().url('URL avatar không hợp lệ').optional(),
  coverUrl: z.string().url('URL cover không hợp lệ').optional()
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1),
});


// export const createUserSchema = z.object({
//   firstName: nameSchema,
//   lastName: nameSchema,
//   username: usernameSchema.optional(),
//   email: emailSchema,
//   password: passwordSchema,
//   phoneNumber: phoneSchema.optional(),
//   phoneCode: z.literal('+84').default('+84'),
//   role: UserRoleEnum.default('customer'),
//   status: UserStatusEnum.default('active'),
//   bio: z.string().max(500).optional(),
//   dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
//   gender: GenderEnum.optional()
// });

// export const updateUserSchema = z.object({
//   firstName: nameSchema.optional(),
//   lastName: nameSchema.optional(),
//   username: usernameSchema.optional(),
//   email: emailSchema.optional(),
//   phoneNumber: phoneSchema.optional(),
//   role: UserRoleEnum.optional(),
//   status: UserStatusEnum.optional(),
//   bio: z.string().max(500).optional(),
//   dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
//   gender: GenderEnum.optional(),
//   avatarUrl: z.string().url().optional(),
//   coverUrl: z.string().url().optional()
// });

export const validateVietnamesePhone = (phone: string): boolean => {
  const cleaned = cleanVietnamesePhone(phone);
  return VIETNAM_PHONE_REGEX.test(cleaned);
};

export const formatVietnamesePhone = (phone: string): string => {
  const cleaned = cleanVietnamesePhone(phone);
  // Format: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return cleaned;
};

// === ERROR MESSAGES ===
export const ValidationMessages = {
  REQUIRED: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 8 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  USERNAME_INVALID: 'Tên đăng nhập không hợp lệ',
  NAME_INVALID: 'Tên chỉ được chứa chữ cái',
  TERMS_NOT_ACCEPTED: 'Bạn phải đồng ý với điều khoản sử dụng'
} as const;

