import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <div className="max-w-md mt-4 rounded-lg border border-destructive/50 p-4">
      <h3 className="font-semibold text-destructive">Xóa tài khoản</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Xóa vĩnh viễn tài khoản của bạn và toàn bộ dữ liệu liên quan.
      </p>
      <DeleteConfirmation />
    </div>
  )
}

export default DeleteAccount
