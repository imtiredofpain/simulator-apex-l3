import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@shared/components/ui/sheet';
import { useQueryLog } from '../../hooks/useQueryLog';
import { memo } from 'react';
import { Separator } from '@shared/components/ui/separator';
import { Badge } from '@shared/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/ui/accordion';
import AccordionContentItem from './AccordionContentItem';
import { SkeletonLogsContent } from './SkeletonLogsContent';

interface SheetProps {
  id: number | null;
}

const LogsContent = memo(({ id }: SheetProps) => {
  const { data, isLoading } = useQueryLog(id as number);

  if (!id) return null;

  return (
    <SheetContent className="min-w-[1000px] overflow-auto">
      {isLoading || !data ? (
        <SkeletonLogsContent />
      ) : (
        <>
          <SheetHeader>
            <SheetTitle>
              <div className="flex min-w-full gap-10">
                <div className=" flex flex-col gap-1 justify-start">
                  <div className="text-left text-md font-medium text-accent-foreground uppercase tracking-wider flex-1">
                    INTEGRATION
                  </div>
                  <div className="whitespace-nowrap text-sm text-muted-foreground flex-1">
                    {data.data.integration}
                  </div>
                </div>
                <div className="flex flex-col  gap-1">
                  <div className="text-left text-md font-medium text-accent-foreground uppercase tracking-wider flex-1">
                    CHANNEL
                  </div>
                  <div className="whitespace-nowrap text-sm text-muted-foreground flex-1">
                    {data.data.channel}
                  </div>
                </div>
                <div className=" flex flex-col gap-1">
                  <div className="text-left text-md font-medium text-accent-foreground uppercase tracking-wider flex-1">
                    OPERATION
                  </div>
                  <div className="whitespace-nowrap text-sm text-muted-foreground flex-1">
                    {data.data.operation}
                  </div>
                </div>
              </div>
            </SheetTitle>
            <SheetDescription></SheetDescription>
            <Separator className="mt-3" />
          </SheetHeader>
          <div className="flex-1 auto-rows-min gap-6 px-4 w-full">
            <div className="w-full bottom-1 p-3 bg-accent rounded-md flex gap-3  items-center">
              <Badge
                className="line-clamp-2 w-fit flex-none"
                variant={
                  data.data.statusCode >= 200 && data.data.statusCode <= 299
                    ? 'success'
                    : 'destructive'
                }
              >
                {data.data.statusCode}
              </Badge>
              <span>{data.data.httpMethod}</span>
              <span className=" text-blue-500">{data.data.url}</span>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-md cursor-pointer">
                  Заголовки запроса
                </AccordionTrigger>
                <AccordionContent>
                  <AccordionContentItem
                    name="Headers"
                    data={data.data.requestHeaders}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-md cursor-pointer">
                  Тело запроса
                </AccordionTrigger>
                <AccordionContent>
                  <AccordionContentItem
                    name="Body"
                    data={data.data.requestBody}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-md cursor-pointer">
                  Заголовки ответа
                </AccordionTrigger>
                <AccordionContent>
                  <AccordionContentItem
                    name="Headers"
                    data={data.data.responseHeaders}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-md cursor-pointer">
                  Тело ответа
                </AccordionTrigger>
                <AccordionContent>
                  <AccordionContentItem
                    name="Body"
                    data={data.data.responseBody}
                  />
                </AccordionContent>
              </AccordionItem>
              {(data.data.exceptionMessage ||
                data.data.exceptionStackTrace) && (
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-md cursor-pointer text-red-500 ">
                    Исключение
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="w-full bottom-1 p-3 rounded-md flex-col flex gap-3">
                      {data.data.exceptionMessage && (
                        <AccordionContentItem
                          name="Message"
                          data={data.data.exceptionMessage}
                          isJson={false}
                        />
                      )}
                      {data.data.exceptionStackTrace && (
                        <AccordionContentItem
                          name="Stack Trace"
                          data={data.data.exceptionStackTrace}
                          isJson={false}
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
          <SheetFooter></SheetFooter>
        </>
      )}
    </SheetContent>
  );
});

export { LogsContent };
