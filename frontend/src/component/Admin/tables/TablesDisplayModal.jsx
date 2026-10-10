import { useTranslation } from "react-i18next";
import TableUpdateDeleteModal from "./TableUpdateDeleteModal";
import { useState } from "react";
import RestaurantTableCard from "../../ui/RestaurantTableCard";
import RestaurantTableDetails from "../../ui/RestaurantTableDetails";

export default function TablesDisplay({ tables, onUpdate }) {
  const { t } = useTranslation();
  const [selectedTable, setSelectedTable] = useState(null);

  return (
    <>
      {tables.map((table) => {
        const status = table.current_reservation ? "reserved" : table.status;

        return (
          <RestaurantTableCard
            key={table.id ?? table.name}
            table={table}
            status={status}
            statusLabel={t(`tables_workspace.${status}`)}
            tableLabel={t("tables_workspace.table")}
            capacityLabel={t("capacity")}
            noteLabel={t("note")}
            actionLabel={t("tables_workspace.edit_table")}
            onClick={() => setSelectedTable(table)}
          >
            <RestaurantTableDetails table={table} />
          </RestaurantTableCard>
        );
      })}

      {selectedTable && (
        <TableUpdateDeleteModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onUpdated={() => {
            onUpdate();
            setSelectedTable(null);
          }}
        />
      )}
    </>
  );
}
