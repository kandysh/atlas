export default function NavUser() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-medium text-primary">JD</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">John Doe</p>
        <p className="text-xs text-muted-foreground truncate">
          john.doe@example.com
        </p>
      </div>
    </div>
  );
}
