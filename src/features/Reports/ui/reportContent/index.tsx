import type { IReport, IReportType } from '@features/Reports/types';
import { useSetting } from '@features/Settings/model/hooks';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@shared/components/ui/tabs';
import { Info, History, FileCode } from 'lucide-react';
import { memo } from 'react';
import ReportHistory from './History';
import ReportInfo from './Info';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';
import useMe from '@features/Users/hooks/useMe';
import AccordionContentItem from '@features/ApiLogs/ui/logsContents/AccordionContentItem';

interface ReportContentProps {
  type?: IReportType;
  report?: IReport;
  actions?: EnumsUnits;
  systemTypes?: EnumsUnits;
}

function ReportContent(props: ReportContentProps) {
  const { report, actions, systemTypes, type } = props;

  const { isLoading: userIsLoading, data: { user } = {} } = useMe();

  const { value } = useSetting<string>('defaultTabActive');

  if (!report || userIsLoading || !user) {
    return null;
  }

  const isRoot = user.roleId == 1;

  return (
    <Tabs
      defaultValue={value || 'info'}
      className="w-full wrap-break-word h-full"
    >
      <TabsList className="bg-transparent p-0! h-8! gap-2">
        <TabsTrigger value="info">
          <Info />
          <div>Общая информация</div>
        </TabsTrigger>
        <TabsTrigger value="history">
          <History />
          <div>История</div>
        </TabsTrigger>
        {isRoot && (
          <TabsTrigger value="raw">
            <FileCode />
            <div>Исходные данные</div>
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="info">
        <ReportInfo report={report} systemTypes={systemTypes} />
      </TabsContent>
      {isRoot && (
        <TabsContent value="raw">
          <div className="flex flex-col gap-3 mt-3">
            <AccordionContentItem
              name="Исходные данные для отчета"
              data={JSON.stringify(report, null, 2)}
            />

            <AccordionContentItem
              name="Исходные данные для типа отчета"
              data={JSON.stringify(type, null, 2)}
            />
          </div>
        </TabsContent>
      )}
      <TabsContent value="history">
        <ReportHistory actions={actions} history={report.history || []} />
      </TabsContent>
    </Tabs>
  );
}

export default memo(ReportContent);
