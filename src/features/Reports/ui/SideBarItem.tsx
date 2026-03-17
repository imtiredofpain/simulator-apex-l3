import { memo } from "react";
import type { IReportType } from "../types";
import { Book } from "lucide-react";
import { SidebarMenuSubButton, SidebarMenuSubItem } from "@shared/components/ui/sidebar";
import { Link } from "react-router-dom";
import { PATHS } from "@shared/config/pathRoute";
import { ICON_BY_TYPE } from "../utils/icons";

interface ReportsSideBarItemProps {
  type: IReportType;
}

function ReportsSideBarItem(props: ReportsSideBarItemProps) {
  const { type } = props;
   const Icon = ICON_BY_TYPE[type.type] ?? Book;
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        size={"md"}
        className="h-fit py-1 cursor-pointer"
      >
        <Link to={PATHS.reports.byType(type.type)}>
          <div className="flex flex-row gap-2 items-center">
            <div className="text-muted-foreground h-4 w-4">
              <Icon size={16} />
            </div>
            <div className="overflow-hidden line-clamp-2">
              {type.description}
            </div>
          </div>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export default memo(ReportsSideBarItem);