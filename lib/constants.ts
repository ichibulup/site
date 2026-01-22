import { User as TestUser, UserActivityStatus, UserRole, UserStatus } from "@/lib/interfaces"
import {
  Wifi,
  Waves,
  Dumbbell,
  Book,
  // Truck,
  PartyPopper,
  Briefcase,
  HelpCircle,
  FileText,
  RefreshCw,
  Globe,
  Car,
  PawPrint,
  Tv,
  Thermometer,
  Cigarette,
  Cable,
  Maximize,
  Bath,
  Phone,
  Sprout,
  Hammer,
  Bus,
  Mountain,
  VolumeX,
  Home,
  Warehouse,
  Building,
  Castle,
  Trees,
  LucideIcon,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  ArchiveX,
  Inbox,
  File,
  Send,
  Trash2,
  Banknote,
  CreditCard,
  CircleDollarSign,
  CircleCheck,
  Package,
  ShieldCheck,
  Wallet,
  Expand,
  Info,
  User,
  ChefHat,
  UtensilsCrossed,
  MenuSquare,
  Users,
  UserCheck,
  Package2,
  ClipboardList,
  BarChart3,
  Settings2,
  MessageSquare,
  TrendingUp,
  QrCode,
  Menu,
  Search,
  Store,
  Truck,
  Clock,
  MapPin,
  ShoppingCart,
  Heart,
  Utensils,
  Calendar,
  MessageCircle,
  Camera,
  Award,
  Mail,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Twitch
} from "lucide-react";

export const appGlobal = {
  name: "Gorthenburg",
  // name: "Waddles",
  description: "Design by Japtor Gorthenburg",
  title: "Comprehensive Restaurant Management System",
  address: "208 Main St, Hai Bà Trưng, Hà Nội, Việt Nam",
  times: "06:00 - 22:00 (Hằng ngày)",
  opening: "06:00 - 22:00 (GMT+7) (Thứ Hai - Chủ Nhật)",
  phone: "(+84) 123 456 789",
  hotline: "(028) 1876 5439",
  email: "info@gorth.org",
  website: "www.gorth.org",
  currency: "VND",
  locales: "vi-VN",
  zalo: "https://zalo.me/0123456789",
  facebook: "https://www.facebook.com/gorth.org",
  instagram: "https://www.instagram.com/gorth.org",
  twitter: "https://www.twitter.com/gorth.org",
  youtube: "https://www.youtube.com/gorth.org",
  github: "https://www.github.com/gorth.org",
  twitch: "https://www.twitch.tv/gorth.org",
  copyright: "Bản quyền © Gorth Inc. 2020 - " + (new Date().getFullYear()) + " Bảo lưu mọi quyền.",
  pro: "Copyright © &copy; 2020 - " + new Date().getFullYear() + " Gorth Inc. All rights reserved.",
  copyleft: "Bản quyền © Waddles Corp. 2020 - " + new Date().getFullYear() + " Cung cấp bởi Gorth Inc.",
  noob: "Copyright © 2020 - " + new Date().getFullYear() + " Waddles Corp. Powered by Gorth Inc.",
}

export const navigation = [
  {
    title: "Thực đơn",
    href: "/menu",
    icon: Utensils,
    description: "Khám phá các món ăn ngon"
  },
  {
    title: "Đặt bàn",
    href: "/booking",
    icon: Calendar,
    description: "Đặt bàn trước để có chỗ ngồi tốt nhất"
  },
  {
    title: "Yêu thích",
    href: "/favorite",
    icon: Heart,
    description: "Xem các món ăn yêu thích của bạn"
  },
  {
    title: "Khám phá",
    href: "#",
    icon: Camera,
    children: [
      {
        title: "Thư viện ảnh",
        href: "/gallery",
        description: "Những khoảnh khắc đẹp tại nhà hàng"
      },
      {
        title: "Blog ẩm thực",
        href: "/blog",
        description: "Câu chuyện và kinh nghiệm ẩm thực"
      },
      {
        title: "Đánh giá",
        href: "/review",
        description: "Đánh giá từ khách hàng"
      }
    ]
  },
  {
    title: "Liên hệ",
    href: "/contact",
    icon: Mail,
    description: "Thông tin liên hệ và hỗ trợ"
  }
  // { name: "Contact", href: "/contact" },
  // { name: "About Us", href: "/about" },
  // { name: "Pages", href: "/pages" },
  // { name: "Components", href: "/manager" },
]

export const footer = {
  introduction: "Nhà hàng ẩm thực Việt Nam truyền thống với hơn 10 năm kinh nghiệm. Chúng tôi tự hào mang đến những món ăn ngon nhất từ khắp ba miền Bắc - Trung - Nam trong không gian ấm cúng và thân thiện.",
  information: [
    {
      title: "Thành tựu",
      description: [
        {
          icon: Award,
          color: "professional-orange",
          text: "Top 10 nhà hàng Việt Nam 2024"
        },
        {
          icon: Star,
          color: "professional-orange",
          text: "4.8/5 sao đánh giá khách hàng"
        },
        {
          icon: Heart,
          color: "professional-orange",
          text: "10,000+ khách hàng hài lòng"
        }
      ],
    },
    {
      title: "Thông tin liên hệ",
      description: [
        {
          icon: MapPin,
          color: "professional-main",
          text: "Địa chỉ: " + appGlobal.address
        },
        {
          icon: Phone,
          color: "professional-main",
          text: "Hotline: " + appGlobal.phone
        },
        {
          icon: Mail,
          color: "professional-main",
          text: "Email: " + appGlobal.email
        },
        {
          icon: Clock,
          color: "professional-main",
          text: "Giờ mở cửa: " + appGlobal.opening
        }
      ]
    },
    {
      title: "Kết nối với chúng tôi",
      description: [
        {
          icon: Calendar,
          color: "professional-main",
          text: "Đặt bàn trước 24h để có ưu đãi"
        },
        {
          icon: MessageCircle,
          color: "professional-main",
          text: "Chat trực tiếp với chúng tôi hoặc chat qua Zalo"
        },
        {
          icon: Camera,
          color: "professional-main",
          text: "Tag @restaurant để được repost"
        }
      ]
    }
  ],
  feedback: "Phản hồi nóng về chất lượng sản phẩm và dịch vụ. Đội ngũ Kiểm Soát Chất Lượng của chúng tôi sẵn sàng lắng nghe quý khách.",
  sections: [
    {
      title: "Khám phá",
      items: [
        {
          name: "Trang chủ",
          icon: Home,
          color: "#",
          href: "/customer"
        },
        {
          name: "Thực đơn",
          icon: MenuSquare,
          color: "#",
          href: "/customer/menu"
        },
        {
          name: "Đặt bàn",
          icon: Calendar,
          color: "#",
          href: "/customer/booking"
        },
        {
          name: "Thư viện ảnh",
          icon: GalleryVerticalEnd,
          color: "#",
          href: "/customer/gallery"
        },
        {
          name: "Blog ẩm thực",
          icon: Book,
          color: "#",
          href: "/customer/blog"
        }
      ]
    },
    {
      title: "Dịch vụ",
      items: [
        {
          name: "Đặt bàn online",
          icon: Calendar,
          color: "#",
          href: "/customer/booking"
        },
        {
          name: "Giao hàng tận nơi",
          icon: Truck,
          color: "#",
          href: "#"
        },
        {
          name: "Tổ chức tiệc",
          icon: PartyPopper,
          color: "#",
          href: "#"
        },
        {
          name: "Buffet cuối tuần",
          icon: UtensilsCrossed,
          color: "#",
          href: "#"
        },
        {
          name: "Menu doanh nghiệp",
          icon: Briefcase,
          color: "#",
          href: "#"
        }
      ]
    },
    {
      title: "Hỗ trợ",
      items: [
        {
          name: "Liên hệ",
          icon: Mail,
          color: "#",
          href: "/contact"
        },
        {
          name: "Câu hỏi thường gặp",
          icon: HelpCircle,
          color: "#",
          href: "#"
        },
        {
          name: "Chính sách đặt bàn",
          icon: FileText,
          color: "#",
          href: "#"
        },
        {
          name: "Đánh giá của bạn",
          icon: Star,
          color: "#",
          href: "/customer/reviews"
        },
        {
          name: "Góp ý & Khiếu nại",
          icon: MessageSquare,
          color: "#",
          href: "/customer/contact"
        }
      ]
    },
    {
      title: "Phương thức thanh toán",
      items: [
        {
          name: "Chuyển khoản ngân hàng",
          icon: CircleDollarSign,
          color: "#",
          href: "#"
        },
        {
          name: "Tiền mặt",
          icon: Banknote,
          color: "#",
          href: "#"
        },
        {
          name: "Thẻ ATM",
          icon: CreditCard,
          color: "#",
          href: "#"
        },
        {
          name: "PayPal",
          icon: Wallet,
          color: "#",
          href: "#"
        }
      ]
    },
    {
      title: "Chính sách & Thông tin",
      items: [
        {
          name: "Chính sách bảo hành",
          icon: CircleCheck,
          color: "#",
          href: "#"
        },
        {
          name: "Chính sách đổi trả",
          icon: RefreshCw,
          color: "#",
          href: "#"
        },
        {
          name: "Chính sách vận chuyển",
          icon: Package,
          color: "#",
          href: "#"
        },
        {
          name: "Chính sách bảo mật",
          icon: ShieldCheck,
          color: "#",
          href: "#"
        },
        {
          name: "Chính sách thanh toán",
          icon: Wallet,
          color: "#",
          href: "#"
        },
        {
          name: "Chính sách kiểm tra",
          icon: Expand,
          color: "#",
          href: "#"
        },
        {
          name: "Hướng dẫn mua hàng online",
          icon: Globe,
          color: "#",
          href: "#"
        },
        {
          name: "Về chúng tôi",
          icon: Info,
          color: "#",
          href: "/about"
        }
      ]
    },
    {
      title: "Mạng xã hội",
      items: [
        {
          name: "Github",
          icon: Github,
          color: "#9032ac", href: "https://github.com/goraria" },
        {
          name: "Facebook",
          icon: Facebook,
          color: "#0068ff", href: "#" },
        {
          name: "Youtube",
          icon: Youtube,
          color: "#fe080a", href: "#" },
        {
          name: "Twitter",
          icon: Twitter,
          color: "#249ef0", href: "#" },
        {
          name: "Instagram",
          icon: Instagram,
          color: "#e73495", href: "#" },
      ]
    }
  ],
  socials: {
    title: "Mạng xã hội",
    item: [
      {
        name: "Facebook",
        icon: Facebook,
        color: "blue",
        hover: "#0068ff",
        link: "https://facebook.com"
      },
      {
        name: "Instagram",
        icon: Instagram,
        color: "blue",
        hover: "#e73495",
        link: "https://instagram.com"
      },
      {
        name: "Twitter",
        icon: Twitter,
        color: "blue",
        hover: "#249ef0",
        link: "https://twitter.com"
      },
      {
        name: "Youtube",
        icon: Youtube,
        color: "blue",
        hover: "#fe080a",
        link: "https://youtube.com"
      },
      // {
      //   name: "Github",
      //   icon: Github,
      //   color: "blue",
      //   hover: "#fe080a",
      //   link: "https://github.com"
      // },
      // {
      //   name: "Twitch",
      //   icon: Twitch,
      //   color: "blue",
      //   hover: "#9146ff",
      //   link: "https://twitch.com"
      // }
    ]
  }
}

export const userDefault = {
  name: "japtor",
  email: "japtor@gorth.org",
  avatar: "/avatar/waddles.jpeg",
}

export const demoSidebar = {
  user: {
    name: "Japtor",
    email: "japtor@gorth.org",
    avatar: "/avatar/waddles.jpeg",
  },
  item: [
    {
      title: "Inbox",
      url: "/message",
      icon: Inbox,
      isActive: true,
    },
    {
      title: "Drafts",
      url: "/message/drafts",
      icon: File,
      isActive: false,
    },
    {
      title: "Sent",
      url: "/message/sent",
      icon: Send,
      isActive: false,
    },
    {
      title: "Junk",
      url: "/message/junk",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "Trash",
      url: "/message/trash",
      icon: Trash2,
      isActive: false,
    },
  ],
}

export const managerSidebar = {
  user: {
    name: "japtor",
    email: "japtor@gorth.org",
    avatar: "/avatar/waddles.jpeg",
  },
  route: "/manager",
  role: "Quản lý",
  teams: [
    {
      name: "Gorth Inc.",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Goraria Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Waddles Restaurant",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Phân tích",
      describe: "Analytics and reporting dashboard",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Tổng quan",
          describe: "Overview dashboard",
          url: "/manager",
        },
        {
          title: "Thống kê",
          describe: "Analytics",
          url: "/manager/analytics",
        },
        {
          title: "Doanh thu",
          describe: "Revenue analytics",
          url: "/manager/analytics/revenue",
        },
        {
          title: "Báo cáo",
          describe: "Business reports",
          url: "/manager/analytics/reports",
        },
        {
          title: "Xu hướng",
          describe: "Trends analysis",
          url: "/manager/analytics/trends",
        },
      ],
    },
    {
      title: "Thực đơn",
      describe: "Menu management and organization",
      url: "#",
      icon: MenuSquare,
      items: [
        {
          title: "Thực đơn chính",
          describe: "Main menus",
          url: "/manager/menu",
        },
        // {
        //   title: "Thực đơn theo thời gian",
        //   describe: "Time-based menus",
        //   url: "/manager/menu/schedule",
        // },
        {
          title: "Phân loại",
          describe: "Categories management",
          url: "/manager/menu/category",
        },
        {
          title: "Danh sách món ăn",
          describe: "All menu items",
          url: "/manager/menu/item",
        },
        {
          title: "Khuyến mãi",
          describe: "Promotional menus",
          url: "/manager/menu/promotion",
        },
        {
          title: "Thiết kế",
          describe: "Menu design",
          url: "/manager/menu/design",
        },
      ],
    },
    // {
    //   title: "Quản lý món ăn",
    //   describe: "Menu items and dishes management",
    //   url: "#",
    //   icon: UtensilsCrossed,
    //   items: [
    //     {
    //       title: "Giá cả",
    //       describe: "Pricing management",
    //       url: "/manager/menu-item/pricing",
    //     },
    //     {
    //       title: "Tình trạng",
    //       describe: "Availability status",
    //       url: "/manager/menu-item/status",
    //     },
    //   ],
    // },
    {
      title: "Công thức",
      describe: "Recipes and cooking instructions",
      url: "#",
      icon: ChefHat,
      items: [
        {
          title: "Công thức nấu ăn",
          describe: "Recipe management",
          url: "/manager/recipe",
        },
        {
          title: "Nguyên liệu",
          describe: "Recipe ingredients",
          url: "/manager/recipe/ingredient",
        },
        {
          title: "Quy trình",
          describe: "Cooking processes",
          url: "/manager/recipe/processes",
        },
        {
          title: "Chi phí",
          describe: "Recipe costing",
          url: "/manager/recipe/costing",
        },
      ],
    },
    {
      title: "Nhân viên",
      describe: "Staff management and scheduling",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Danh sách nhân viên",
          describe: "Staff directory",
          url: "/manager/staff",
        },
        {
          title: "Lịch làm việc",
          describe: "Work schedules",
          url: "/manager/staff/schedules",
        },
        {
          title: "Chấm công",
          describe: "Attendance tracking",
          url: "/manager/staff/attendance",
        },
        {
          title: "Đánh giá",
          describe: "Performance reviews",
          url: "/manager/staff/reviews",
        },
      ],
    },
    {
      title: "Khách hàng",
      describe: "Customer management and loyalty",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Danh sách khách hàng",
          describe: "Customer database",
          url: "/manager/customer",
        },
        {
          title: "Đặt bàn",
          describe: "Reservations management",
          url: "/manager/customer/reservation",
        },
        {
          title: "Đơn hàng",
          describe: "Order history",
          url: "/manager/customer/order",
        },
        {
          title: "Khách hàng thân thiết",
          describe: "Loyalty programs",
          url: "/manager/customer/loyalty",
        },
      ],
    },
    {
      title: "Báo cáo kho",
      describe: "Inventory reporting and tracking",
      url: "#",
      icon: Package2,
      items: [
        {
          title: "Tồn kho",
          describe: "Current inventory",
          url: "/manager/inventory",
        },
        {
          title: "Phiếu nhập kho",
          describe: "Warehouse receipt",
          url: "/manager/inventory/receipt",
        },
        {
          title: "Phiếu xuất kho",
          describe: "Warehouse issue",
          url: "/manager/inventory/issue",
        },
        {
          title: "Phiếu chuyển kho",
          describe: "Warehouse transfer",
          url: "/manager/inventory/transfer",
        },
        {
          title: "Cân bằng kho",
          describe: "Inventory balance",
          url: "/manager/inventory/balance",
        },
        {
          title: "Nguyên liệu",
          describe: "Inventory items",
          url: "/manager/inventory/ingredient",
        },
      ],
    },
    {
      title: "Nhà cung cấp",
      describe: "Supplier directory",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Danh sách nhà cung cấp",
          describe: "Supplier list",
          url: "/manager/supplier",
        },
      ],
    },
    {
      title: "Đơn hàng",
      describe: "Order processing and tracking",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Đơn hàng hiện tại",
          describe: "Current orders",
          url: "/manager/order",
        },
        {
          title: "Lịch sử",
          describe: "Order history",
          url: "/manager/order/history",
        },
        {
          title: "Theo dõi",
          describe: "Order tracking",
          url: "/manager/order/tracking",
        },
        {
          title: "Thanh toán",
          describe: "Payment processing",
          url: "/manager/order/payments",
        },
      ],
    },
    {
      title: "Bàn ăn",
      describe: "Table management and QR ordering",
      url: "#",
      icon: QrCode,
      items: [
        {
          title: "Sơ đồ bàn",
          describe: "Table layout",
          url: "/manager/table",
        },
        {
          title: "Trạng thái bàn",
          describe: "Table status",
          url: "/manager/table/status",
        },
      ],
    },
    {
      title: "Hỗ trợ khách hàng",
      describe: "Customer support and feedback",
      url: "/manager/support",
      icon: MessageSquare,
      items: [],
    },
    {
      title: "Cài đặt",
      describe: "System settings and configuration",
      url: "/manager/settings",
      icon: Settings2,
      items: [],
    },
  ],
  projects: [
    {
      name: "Quản lý thực đơn",
      url: "/manager/menu",
      icon: MenuSquare,
    },
    // {
    //   name: "Phân tích doanh thu",
    //   url: "/manager/analytics/revenue",
    //   icon: TrendingUp,
    // },
    // {
    //   name: "Hỗ trợ khách hàng",
    //   url: "/manager/support/chat",
    //   icon: MessageSquare,
    // },
  ],
}

export const administratorSidebar = {
  user: {
    name: "japtor",
    email: "japtor@gorth.org",
    avatar: "/avatar/waddles.jpeg",
  },
  route: "/administrator",
  role: "Quản trị hệ thống",
  teams: [
    {
      name: "Gorth Inc.",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Goraria Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Waddles Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Quản trị hệ thống",
      describe: "System administration tasks",
      url: "#",
      icon: ShieldCheck,
      items: [
        {
          title: "Chỉnh sửa nhà hàng",
          describe: "Edit restaurant details",
          url: "/administrator/restaurant",
        },
        {
          title: "Chỉnh sửa tổ chức",
          describe: "Manage organizations",
          url: "/administrator/organization",
        },
        {
          title: "Thành viên tổ chức",
          describe: "Organization memberships",
          url: "/administrator/organization/memberships",
        },
        {
          title: "Chuỗi nhà hàng",
          describe: "Restaurant chains",
          url: "/administrator/organization/chains",
        },
        {
          title: "Quản lý người dùng",
          describe: "User and role management",
          url: "/administrator/user",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Restaurant Analytics",
      url: "#",
      icon: BarChart3,
    },
    {
      name: "Customer Support",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Staff Management",
      url: "#",
      icon: Users,
    },
  ],
}

export const settingsSidebar = {
  user: {
    name: "japtor",
    email: "japtor@gorth.org",
    avatar: "/avatar/waddles.jpeg",
  },
  route: "/setting",
  role: "Cài đặt",
  teams: [
    {
      name: "Gorth Inc.",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Goraria Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Waddles Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Cài đặt tài khoản",
      describe: "Account settings and preferences",
      url: "#",
      icon: User,
      items: [
        {
          title: "Thông tin cá nhân",
          describe: "Personal information",
          url: "/setting",
        },
        {
          title: "Thông tin liên hệ",
          describe: "Contact information",
          url: "/setting/information",
        },
        {
          title: "Bảo mật",
          describe: "Security settings",
          url: "/setting/information/security",
        },
        {
          title: "Quyền riêng tư",
          describe: "Privacy settings",
          url: "/setting/privacy",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Restaurant Analytics",
      url: "#",
      icon: BarChart3,
    },
    {
      name: "Customer Support",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Staff Management",
      url: "#",
      icon: Users,
    },
  ],
}

// Staff/Employee Sidebar Configuration
export const staffSidebar = {
  user: {
    name: "Nhân viên",
    email: "staff@waddles.com",
    avatar: "/avatar/staff.jpeg",
  },
  route: "/staff",
  role: "Nhân viên",
  navMain: [
    {
      title: "Tổng quan",
      describe: "Dashboard for staff overview",
      url: "/staff",
      icon: BarChart3,
      items: [],
    },
    {
      title: "Đặt bàn",
      describe: "Table reservation system",
      url: "#",
      icon: QrCode,
      items: [
        {
          title: "Tất cả đặt bàn",
          describe: "Make new reservation",
          url: "/staff/reservation",
        },
      ],
    },
    {
      title: "Đơn hàng",
      describe: "Order management and processing",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Đơn hàng hiện tại",
          describe: "Current active orders",
          url: "/staff/order",
        },
        {
          title: "Nhận đơn mới",
          describe: "Take new orders",
          url: "/staff/order/new",
        },
      ],
    },
    {
      title: "Bàn ăn",
      describe: "Table service and management",
      url: "#",
      icon: QrCode,
      items: [
        {
          title: "Danh sách bàn",
          describe: "Table layout and status",
          url: "/staff/table",
        },
      ],
    },
    {
      title: "POS",
      describe: "Point of Sale system",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Thu ngân",
          describe: "Cashier interface",
          url: "/staff/pos",
        },
      ],
    },
    {
      title: "Khách hàng",
      describe: "Customer management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Danh sách khách hàng",
          describe: "Customer list",
          url: "/staff/customer",
        },
        {
          title: "Đặt bàn khách",
          describe: "Customer reservations",
          url: "/staff/customer/reservations",
        },
        {
          title: "Thẻ thành viên",
          describe: "Loyalty program",
          url: "/staff/customer/loyalty",
        },
        {
          title: "Hồ sơ khách",
          describe: "Customer profile",
          url: "/staff/customer/profile",
        },
      ],
    },
    {
      title: "Cá nhân",
      describe: "Personal information and schedule",
      url: "#",
      icon: User,
      items: [
        {
          title: "Lịch làm việc",
          describe: "Work schedule",
          url: "/staff/schedule",
        },
        {
          title: "Công việc",
          describe: "Assigned tasks",
          url: "/staff/tasks",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Đơn hàng",
      url: "/staff/order",
      icon: ClipboardList,
    },
    {
      name: "Bàn ăn",
      url: "/staff/table",
      icon: QrCode,
    },
  ],
}

// Customer Sidebar Configuration
export const customerSidebar = {
  user: {
    name: "Khách hàng",
    email: "customer@example.com",
    avatar: "/avatar/customer.jpeg",
  },
  route: "/customer",
  role: "Khách hàng",
  teams: [],
  navMain: [
    {
      title: "Trang chủ",
      describe: "Customer dashboard",
      url: "/customer",
      icon: Home,
      items: [],
    },
    {
      title: "Đặt bàn",
      describe: "Table reservation system",
      url: "#",
      icon: QrCode,
      items: [
        {
          title: "Danh sách đặt bàn",
          describe: "Reservation list",
          url: "/customer/reservations",
        },
        {
          title: "Lịch sử đặt bàn",
          describe: "Reservation history",
          url: "/customer/reservations/history",
        },
      ],
    },
    {
      title: "Đơn hàng",
      describe: "Order history and tracking",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Đơn hàng của tôi",
          describe: "Order history",
          url: "/customer/orders",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Đặt bàn",
      url: "/customer/reservations",
      icon: QrCode,
    },
    {
      name: "Đơn hàng",
      url: "/customer/orders",
      icon: ClipboardList,
    },
  ],
}

export const warehouseSidebar = {
  user: {
    name: "japtor",
    email: "japtor@gorth.org",
    avatar: "/avatar/waddles.jpeg",
  },
  route: "/warehouse",
  role: "Quản lý kho",
  teams: [
    {
      name: "Gorth Inc.",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Goraria Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Waddles Restaurant",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Phân tích",
      describe: "Analytics and reporting dashboard",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Tổng quan",
          describe: "Overview dashboard",
          url: "/warehouse",
        },
        {
          title: "Thống kê",
          describe: "Analytics",
          url: "/warehouse/analytics",
        },
        {
          title: "Doanh thu",
          describe: "Revenue analytics",
          url: "/warehouse/analytics/revenue",
        },
        {
          title: "Báo cáo",
          describe: "Business reports",
          url: "/warehouse/analytics/reports",
        },
        {
          title: "Xu hướng",
          describe: "Trends analysis",
          url: "/warehouse/analytics/trends",
        },
      ],
    },
    {
      title: "Quản lý kho",
      describe: "Inventory and stock management",
      url: "#",
      icon: Package2,
      items: [
        {
          title: "Tổng quan",
          describe: "Current inventory",
          url: "/warehouse/inventory",
        },
        {
          title: "Phiếu nhập kho",
          describe: "Warehouse receipt",
          url: "/warehouse/inventory/receipt",
        },
        {
          title: "Phiếu xuất kho",
          describe: "Warehouse issue",
          url: "/warehouse/inventory/issue",
        },
        {
          title: "Phiếu chuyển kho",
          describe: "Warehouse transfer",
          url: "/warehouse/inventory/transfer",
        },
        {
          title: "Cân bằng kho",
          describe: "Inventory balance",
          url: "/warehouse/inventory/balance",
        },
        {
          title: "Nguyên liệu",
          describe: "Inventory items",
          url: "/warehouse/inventory/ingredient",
        },
        {
          title: "Kiểm tra kho",
          describe: "Inventory audit",
          url: "/warehouse/inventory/audit",
        },
      ],
    },
    {
      title: "Nhà cung cấp",
      describe: "Supplier management and loyalty",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Danh sách",
          describe: "Supplier database",
          url: "/warehouse/supplier",
        },
        {
          title: "Đặt hàng",
          describe: "Purchase order management",
          url: "/warehouse/supplier/order",
        },
        {
          title: "Lịch sử đặt hàng",
          describe: "Purchase order history",
          url: "/warehouse/supplier/order/history",
        },
      ],
    },
    {
      title: "Đơn hàng",
      describe: "Order processing and tracking",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Đơn hàng hiện tại",
          describe: "Current orders",
          url: "/warehouse/order",
        },
        {
          title: "Lịch sử",
          describe: "Order history",
          url: "/warehouse/order/history",
        },
        {
          title: "Theo dõi",
          describe: "Order tracking",
          url: "/warehouse/order/tracking",
        },
        {
          title: "Thanh toán",
          describe: "Payment processing",
          url: "/warehouse/order/payments",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Quản lý kho",
      url: "/warehouse",
      icon: MenuSquare,
    },
  ],
}

export const supplierSidebar = {
  route: "/supplier",
  role: "Nhà cung cấp",
  teams: [
    {
      name: "Gorth Inc.",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Goraria Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Waddles Restaurant",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Tổng quan",
      describe: "Dashboard and analytics",
      url: "/supplier",
      icon: BarChart3,
      items: [
        {
          title: "Trang chủ",
          describe: "Overview dashboard",
          url: "/supplier",
        },
        {
          title: "Thống kê",
          describe: "Statistics and analytics",
          url: "/supplier/analytics",
        },
        {
          title: "Doanh thu",
          describe: "Revenue analytics",
          url: "/supplier/analytics/revenue",
        },
        {
          title: "Báo cáo",
          describe: "Business reports",
          url: "/supplier/analytics/reports",
        },
        {
          title: "Xu hướng",
          describe: "Trends analysis",
          url: "/supplier/analytics/trends",
        },
      ],
    },
    {
      title: "Đơn hàng từ nhà hàng",
      describe: "Orders from restaurant chains",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Đơn hàng",
          describe: "Incoming orders",
          url: "/supplier/order",
        },
        {
          title: "Theo dõi",
          describe: "Order tracking",
          url: "/supplier/order/tracking",
        },
        {
          title: "Thanh toán",
          describe: "Payment processing",
          url: "/supplier/order/payments",
        },
        {
          title: "Lịch sử",
          describe: "Order history",
          url: "/supplier/order/history",
        },
      ],
    },
    {
      title: "Kho & nguyên liệu",
      describe: "Inventory and ingredient management",
      url: "#",
      icon: Package2,
      items: [
        {
          title: "Tồn kho",
          describe: "Stock inventory",
          url: "/supplier/inventory",
        },
        {
          title: "Nhập kho",
          describe: "Stock receipt",
          url: "/supplier/inventory/receipt",
        },
        {
          title: "Xuất kho",
          describe: "Stock issue",
          url: "/supplier/inventory/issue",
        },
        {
          title: "Chuyển kho",
          describe: "Stock transfer",
          url: "/supplier/inventory/transfer",
        },
        {
          title: "Cân bằng kho",
          describe: "Inventory balance",
          url: "/supplier/inventory/balance",
        },
        {
          title: "Nguyên liệu",
          describe: "Inventory items",
          url: "/supplier/inventory/ingredient",
        },
        {
          title: "Kiểm kê",
          describe: "Inventory audit",
          url: "/supplier/inventory/audit",
        },
      ],
    },
    {
      title: "Tổ chức",
      describe: "Organization details",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Thông tin tổ chức",
          describe: "Organization information",
          url: "/supplier/organization",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Nhà cung cấp",
      url: "/supplier",
      icon: MenuSquare,
    },
  ],
}

// Shared/Public Routes Configuration
export const sharedRoutes = {
  public: [
    { path: "/", title: "Trang chủ" },
    { path: "/about", title: "Giới thiệu" },
    { path: "/contact", title: "Liên hệ" },
    { path: "/pages", title: "Tất cả trang" },
    { path: "/privacy-policy", title: "Chính sách bảo mật" },
    { path: "/terms-of-service", title: "Điều khoản sử dụng" },
  ],
  auth: [
    { path: "/sign-in", title: "Đăng nhập" },
    { path: "/sign-up", title: "Đăng ký" },
  ],
}

export enum AmenityEnum {
  WasherDryer = "WasherDryer",
  AirConditioning = "AirConditioning",
  Dishwasher = "Dishwasher",
  HighSpeedInternet = "HighSpeedInternet",
  HardwoodFloors = "HardwoodFloors",
  WalkInClosets = "WalkInClosets",
  Microwave = "Microwave",
  Refrigerator = "Refrigerator",
  Pool = "Pool",
  Gym = "Gym",
  Parking = "Parking",
  PetsAllowed = "PetsAllowed",
  WiFi = "WiFi",
}

export const AmenityIcons: Record<AmenityEnum, LucideIcon> = {
  WasherDryer: Waves,
  AirConditioning: Thermometer,
  Dishwasher: Waves,
  HighSpeedInternet: Wifi,
  HardwoodFloors: Home,
  WalkInClosets: Maximize,
  Microwave: Tv,
  Refrigerator: Thermometer,
  Pool: Waves,
  Gym: Dumbbell,
  Parking: Car,
  PetsAllowed: PawPrint,
  WiFi: Wifi,
};

export enum HighlightEnum {
  HighSpeedInternetAccess = "HighSpeedInternetAccess",
  WasherDryer = "WasherDryer",
  AirConditioning = "AirConditioning",
  Heating = "Heating",
  SmokeFree = "SmokeFree",
  CableReady = "CableReady",
  SatelliteTV = "SatelliteTV",
  DoubleVanities = "DoubleVanities",
  TubShower = "TubShower",
  Intercom = "Intercom",
  SprinklerSystem = "SprinklerSystem",
  RecentlyRenovated = "RecentlyRenovated",
  CloseToTransit = "CloseToTransit",
  GreatView = "GreatView",
  QuietNeighborhood = "QuietNeighborhood",
}

export const HighlightIcons: Record<HighlightEnum, LucideIcon> = {
  HighSpeedInternetAccess: Wifi,
  WasherDryer: Waves,
  AirConditioning: Thermometer,
  Heating: Thermometer,
  SmokeFree: Cigarette,
  CableReady: Cable,
  SatelliteTV: Tv,
  DoubleVanities: Maximize,
  TubShower: Bath,
  Intercom: Phone,
  SprinklerSystem: Sprout,
  RecentlyRenovated: Hammer,
  CloseToTransit: Bus,
  GreatView: Mountain,
  QuietNeighborhood: VolumeX,
};

export enum PropertyTypeEnum {
  Rooms = "Rooms",
  Tinyhouse = "Tinyhouse",
  Apartment = "Apartment",
  Villa = "Villa",
  Townhouse = "Townhouse",
  Cottage = "Cottage",
}

export const PropertyTypeIcons: Record<PropertyTypeEnum, LucideIcon> = {
  Rooms: Home,
  Tinyhouse: Warehouse,
  Apartment: Building,
  Villa: Castle,
  Townhouse: Home,
  Cottage: Trees,
};

// Add this constant at the end of the file
export const NAVBAR_HEIGHT = 52; // in pixels

// ============================================================================
// ROLE-BASED ROUTE PERMISSIONS
// ============================================================================

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/change-password',
  '/code-error',
  '/auth',
  '/about',
  '/contact',
  '/landing',
  '/booking',
  '/pages',
  '/privacy',
  '/term',
  '/terms-of-service',
  '/coming-soon',
  '/directing',
  '/error',
  '/loading',
  '/not-authorized',
  '/under-maintenance',
  '/menu',
  '/demo',
  '/upload',
  '/api',
  '/_next',
  '/favicon.ico',
];

// Protected routes - tất cả các role đã đăng nhập đều có thể truy cập
export const PROTECTED_ROUTES = [
  '/setting',
  '/dashboard',
  '/profile',
];

// Master role - full access to all routes
export const MASTER_ROUTES = ['*'];

// Admin role routes
export const ADMIN_ROUTES = [
  '/administrator',
  '/manager',
  '/staff',
  '/customer',
  '/deliver',
];

// Manager role routes
export const MANAGER_ROUTES = [
  '/manager',
  '/customer',
];

// Staff role routes
export const STAFF_ROUTES = [
  '/staff',
];

// Customer role routes
export const CUSTOMER_ROUTES = [
  '/customer',
  '/cart'
];

// Deliver role routes
export const DELIVER_ROUTES = [
  '/deliver',
];

// Warehouse role routes
export const WAREHOUSE_ROUTES = [
  '/warehouse',
];

// Supplier role routes
export const SUPPLIER_ROUTES = [
  '/supplier',
];

// Combined role routes mapping
export const ROLE_ROUTES: Record<string, string[]> = {
  master: MASTER_ROUTES,
  admin: ADMIN_ROUTES,
  manager: MANAGER_ROUTES,
  staff: STAFF_ROUTES,
  customer: CUSTOMER_ROUTES,
  deliver: DELIVER_ROUTES,
  warehouse: WAREHOUSE_ROUTES,
  supplier: SUPPLIER_ROUTES,
};

// Default redirect paths for each role
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  master: '/administrator',
  admin: '/administrator',
  manager: '/manager',
  staff: '/staff',
  customer: '/customer',
  deliver: '/deliver',
  warehouse: '/warehouse',
  supplier: '/supplier',
};

// Test users for development

export const testUser: TestUser = {
  activityStatus: UserActivityStatus.available,
  backupCodeEnabled: false,
  banned: false,
  createOrganizationEnabled: false,
  createdAt: new Date(),
  deleteSelfEnabled: false,
  email: '',
  emailNormalized: '',
  hasImage: false,
  id: '00000000-0000-0000-0000-000000000000',
  isOnline: false,
  locked: false,
  loyaltyPoints: 0,
  passwordEnabled: false,
  providers: [],
  role: UserRole.customer,
  status: UserStatus.active,
  totalOrders: 0,
  totalSpent: '',
  totpEnabled: false,
  twoFactorEnabled: false,
  updatedAt: new Date(),
};
