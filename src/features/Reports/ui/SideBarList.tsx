import { memo, useEffect } from "react";
import ReportsSideBarItem from "./SideBarItem";
import { useQueryReportsTypes } from "../hooks/useQueryReportsTypes";
import { SidebarMenuSub, SidebarMenuSubItem } from "@shared/components/ui/sidebar";
import { Skeleton } from "@shared/components/ui/skeleton";
import { useSelectedInn } from "@features/Organizations";
import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@shared/config/pathRoute";

interface ReportsSideBarListProps {
  isOpen?: boolean;
}

const ReportsSideBarList = (props: ReportsSideBarListProps) => {
  const { isOpen } = props;
  const {
    data: { data: reportTypes = [] } = {},
    isLoading,
    refetch,
  } = useQueryReportsTypes({
    disabled: true
  });
  const selectedInn = useSelectedInn();

  useEffect(() => {
    if (!isOpen || !selectedInn) return;
    refetch();
  }, [refetch, isOpen, selectedInn]);

  return (
    <>
      <SidebarMenuSub>
        {!selectedInn && (
          <SidebarMenuSubItem className="gap-2 flex-col flex text-orange-500 bg-orange-500/7 p-1 pr-2 pl-3 rounded-md hover:bg-orange-500 hover:text-white">
            <Link to={PATHS.organizations.main}>
              <div className="flex flex-row gap-2 items-center">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                <span className="text-[14px]">Выберите организацию</span>
              </div>
            </Link>
          </SidebarMenuSubItem>
        )}
        {isLoading && (
          <SidebarMenuSubItem className="gap-2 flex-col flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="flex flex-row gap-2 items-center" key={`sk-${i}`}>
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <Skeleton className="h-7 w-full" />
              </div>
            ))}
          </SidebarMenuSubItem>
        )}
        {!isLoading &&
          reportTypes?.map((type) => (
            <ReportsSideBarItem key={`i-${type.type}`} type={type} />
          ))}
      </SidebarMenuSub>
    </>
  );
};

export default memo(ReportsSideBarList);
