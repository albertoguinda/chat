interface UserListProps {
  users: string[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="p-2 bg-white shadow rounded w-52">
      <h3 className="font-semibold mb-2 text-center">Usuarios</h3>
      <ul className="space-y-1">
        {users.map((u, i) => (
          <li key={i} className="text-sm">{u}</li>
        ))}
      </ul>
    </div>
  );
}
