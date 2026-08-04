import Menu from "../../Admin/MenuManagement/MenuBaseModal";

export default function KitchenManagerMenu() {
  return (
    <Menu
      canManage={false}
      title="Kitchen Menu"
      description="Review availability, production items and platters for the active branch."
    />
  );
}
