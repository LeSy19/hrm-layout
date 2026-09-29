'use client'

interface JobTitleHeaderProps {
    searchTerm: string,
    onSearchChange: (value: string) => void,
    onRefresh: () => void,
    onOpenJobTitleDrawer: () => void,
}

const JobTitleHeader = ({ searchTerm, onRefresh, onSearchChange, onOpenJobTitleDrawer }: JobTitleHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Chức Danh</h1>
                <p className="text-sm text-gray-500">Danh sách và thông tin vị trí công việc trong hệ thống</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Ô Tìm kiếm */}
                <input
                    type="text"
                    placeholder="Tìm tên chức danh, mã chức danh"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Nút Refresh */}
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    ↻ Refresh
                </button>

                {/* Nút Thêm mới */}
                <button
                    onClick={onOpenJobTitleDrawer}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Thêm chức danh
                </button>
            </div>
        </div>
    )
}
export default JobTitleHeader;