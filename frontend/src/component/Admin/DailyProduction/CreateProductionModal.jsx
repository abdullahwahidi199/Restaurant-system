import { useEffect, useState } from "react";
import Select from "react-select";
import instance from "../../../api/axiosInstance";

export default function CreateProductionModal({
  production,
  onClose,
  onSuccess,
}) {
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    menu_item: "",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (production) {
      setForm({
        menu_item: production.menu_item,
        quantity: production.quantity_produced,
        notes: production.notes || "",
      });
    }
  }, [production]);

  const loadItems = async () => {
    const res = await instance.get("/menu/menu-items/");

    setItems(res.data.filter((item) => item.uses_daily_production));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (production) {
      await instance.patch(`/menu/production/${production.id}/`, {
        quantity: form.quantity,
        notes: form.notes,
      });
    } else {
      await instance.post("/menu/production/", form);
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md rounded-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {production ? "Adjust Production" : "Create Production"}
        </h2>

        {!production && (
          <Select
            options={items.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={(selected) =>
              setForm({
                ...form,
                menu_item: selected.value,
              })
            }
          />
        )}

        <input
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity: e.target.value,
            })
          }
          className="w-full border rounded p-2"
          placeholder="Quantity Produced"
        />

        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
          className="w-full border rounded p-2"
          placeholder="Notes"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
