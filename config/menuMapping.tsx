import {
  IconLayoutDashboard,
  IconReceipt2,
  IconUsers,
  IconBox,
  IconSettings,
  IconCards,
  IconCategory,
  IconCalendarEvent,
  IconDiscount,
  IconLayoutGrid,
  IconPhoto,
  IconTicket,
} from "@tabler/icons-react";

import Dashboard from "@/components/Dashboard/Dashboard/Dashboard";
import ListTransaction from "@/components/Transaction/ListTransaction";
import UserManagement from "@/components/Dashboard/UserManagement";
import ListCard from "@/components/Dashboard/Collection/Card/ListCard";
import ListTypeCard from "@/components/Dashboard/Collection/Category/ListCategory";
import ListEvent from "@/components/Dashboard/Collection/Event/ListEvent";
import ListDiscount from "@/components/Dashboard/Collection/Discount/ListDiscount";
import ListMenu from "@/components/Dashboard/Collection/Menu/ListMenu";
import ListBanner from "@/components/Dashboard/Collection/Banner/ListBanner";
import ListVoucher from "@/components/Dashboard/Collection/Voucher/ListVoucher";

export const ICON_MAP: Record<string, any> = {
  IconHome: IconLayoutDashboard,
  IconTransaction: IconReceipt2,
  IconCollection: IconBox,
  IconUsers: IconUsers,
  IconSettings: IconSettings,

  IconCards: IconCards,
  IconCategory: IconCategory,
  IconEvent: IconCalendarEvent,
  IconDiscount: IconDiscount,
  IconMenu: IconLayoutGrid,
  IconBanner: IconPhoto,
  IconVoucher: IconTicket,
};

export const COMPONENT_MAP: Record<string, React.ReactNode> = {
  "/dashboard": <Dashboard />,
  "/transactions": <ListTransaction />,
  "/users": <UserManagement />,
  "/collection/cards": <ListCard />,
  "/collection/categories": <ListTypeCard />,
  "/collection/events": <ListEvent />,
  "/collection/discounts": <ListDiscount />,
  "/collection/menus": <ListMenu />,
  "/collection/banners": <ListBanner />,
  "/collection/vouchers": <ListVoucher />,
};
