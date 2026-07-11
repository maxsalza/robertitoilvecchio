import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  todayCount: number;
  pendingCount: number;
  weekCount: number;
  completedCount: number;
}

export function StatsCards({
  todayCount,
  pendingCount,
  weekCount,
  completedCount,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Turnos Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-navy-900">{todayCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-accent-500">{pendingCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-navy-900">{weekCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Completados (mes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
