import {
  IconArticle,
  IconBox,
  IconCalendarEvent,
  IconCards,
  IconCategory,
  IconDiscount,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconPhoto,
  IconReceipt2,
  IconSettings,
  IconTicket,
  IconUsers,
  IconUsersGroup,
  IconUserShield,
} from "@tabler/icons-react";

import ListArticle from "@/components/Dashboard/Collection/Article/ListArticle";
import ListBanner from "@/components/Dashboard/Collection/Banner/ListBanner";
import ListCard from "@/components/Dashboard/Collection/Card/ListCard";
import ListTypeCard from "@/components/Dashboard/Collection/Category/ListCategory";
import ListDiscount from "@/components/Dashboard/Collection/Discount/ListDiscount";
import ListEvent from "@/components/Dashboard/Collection/Event/ListEvent";
import ListMenu from "@/components/Dashboard/Collection/Menu/ListMenu";
import ListVoucher from "@/components/Dashboard/Collection/Voucher/ListVoucher";
import Dashboard from "@/components/Dashboard/Dashboard/Dashboard";
import ListTransaction from "@/components/Dashboard/Transaction/ListTransaction";
import ListMember from "@/components/Dashboard/UserManagement/ListMember/ListMember";
import ListRole from "@/components/Dashboard/UserManagement/ListRole/ListRole";

export const ICON_MAP: Record<string, any> = {
  IconLayoutDashboard: IconLayoutDashboard,
  IconReceipt2: IconReceipt2,
  IconBox: IconBox,
  IconUsers: IconUsers,
  IconSettings: IconSettings,

  IconCards: IconCards,
  IconCategory: IconCategory,
  IconCalendarEvent: IconCalendarEvent,
  IconDiscount: IconDiscount,
  IconLayoutGrid: IconLayoutGrid,
  IconPhoto: IconPhoto,
  IconTicket: IconTicket,
  IconUserShield: IconUserShield,
  IconUsersGroup: IconUsersGroup,
  IconArticle: IconArticle,
};

export const COMPONENT_MAP: Record<string, React.ReactNode> = {
  "/dashboard": <Dashboard />,
  "/transactions": <ListTransaction />,
  "/members": <ListMember />,
  "/roles": <ListRole />,
  "/cards": <ListCard />,
  "/categories": <ListTypeCard />,
  "/events": <ListEvent />,
  "/discounts": <ListDiscount />,
  "/menus": <ListMenu />,
  "/banners": <ListBanner />,
  "/vouchers": <ListVoucher />,
  "/articles": <ListArticle />,
};
