export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen pt-16 flex flex-col overflow-hidden">
            {children}
        </div>
    );
}
