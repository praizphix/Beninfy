'use client'

import { CrudTable } from '@/components/admin/CrudTable'
import { vehicles } from '@/data/vehicles'

interface FleetVehicle {
  id: string
  vehicleId: string
  label: string
  plateNumber: string
  status: string
  currentCity: string | null
  notes: string | null
  vehicle?: { id: string; name: string }
  [key: string]: unknown
}

export default function AdminFleetVehiclesPage() {
  return (
    <CrudTable<FleetVehicle>
      title="Fleet units"
      description="Manage physical cars and buses available for assignment."
      fetchUrl="/api/admin/fleet-vehicles"
      collectionKey="fleetVehicles"
      itemKey="id"
      createUrl="/api/admin/fleet-vehicles"
      itemUrl={(id) => `/api/admin/fleet-vehicles/${id}`}
      columns={[
        { header: 'Unit', render: (v) => <p className="font-medium text-gray-800">{v.label}</p> },
        { header: 'Plate', render: (v) => <code className="text-xs text-gray-500">{v.plateNumber}</code> },
        { header: 'Type', render: (v) => v.vehicle?.name ?? v.vehicleId },
        { header: 'Status', render: (v) => <span className={v.status === 'available' ? 'text-green-700 text-xs' : 'text-amber-700 text-xs'}>{v.status}</span> },
        { header: 'City', render: (v) => v.currentCity ?? '—' },
        { header: 'Notes', render: (v) => v.notes ?? '—' },
      ]}
      fields={[
        {
          name: 'vehicleId',
          label: 'Vehicle type',
          type: 'select',
          required: true,
          options: vehicles.map((vehicle) => ({ label: vehicle.name, value: vehicle.id })),
        },
        { name: 'label', label: 'Unit label', type: 'text', required: true, placeholder: 'e.g. Sienna 01' },
        { name: 'plateNumber', label: 'Plate number', type: 'text', required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { label: 'Available', value: 'available' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
        { name: 'currentCity', label: 'Current city', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      defaultValues={{ status: 'available' }}
    />
  )
}
