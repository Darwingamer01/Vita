import ResourceExplorer from '@/components/features/ResourceExplorer';

export default function MapPage() {
    return (
        <div className="h-screen pt-16 flex flex-col overflow-hidden">
            <ResourceExplorer initialFilter="ALL" title="Live Map" />
        </div>
    );
}
