import { cn } from "@shared/lib/utils";
import { CircleQuestionMark, type LucideProps } from "lucide-react"
import { memo, type ForwardRefExoticComponent, type RefAttributes } from "react"

interface NoDataPreloaderProps {
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  classNameIcon?: string;
  title?: string;
  titleHasSearch?: string;
  description?: string;
  descriptionHasSearch?: string;
  valueSearch?: string;
}

function NoDataPreloader(props: NoDataPreloaderProps) {
  const {
    icon: Icon = CircleQuestionMark,
    classNameIcon = "",
    valueSearch,
    title = "Нет данных!",
    titleHasSearch = "Ничего не найдено!",
    description = "Пожалуйста попробуйте еще раз или обратитесь к администратору системы!",
    descriptionHasSearch = `По вашему запросу ничего не найдено. Пожалуйста попробуйте еще раз или обратитесь к администратору системы!`,
  } = props;
  const hasSearch = !!valueSearch;
  return (
    <div className="flex flex-col justify-center items-center text-center gap-6 p-4">
      <div>
        <Icon
          size={24}
          className={cn("h-9 w-9 text-blue-500", classNameIcon)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{hasSearch ? titleHasSearch : title}</div>
        <div className={cn("text-muted-foreground text-xs", hasSearch ? "max-w-[400px]" : "max-w-[250px]")}>
          {hasSearch ? descriptionHasSearch : description}
        </div>
      </div>
    </div>
  );
}

export default memo(NoDataPreloader)