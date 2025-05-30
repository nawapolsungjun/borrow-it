import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';

interface Item {
  id: number;
  name: string;
  serialNumber: string;
  status: string;
  description: string | null;
}

export default function AdminItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState({ name: '', serialNumber: '', description: '' });
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'ADMIN') {
      router.push('/auth/login');
    }
    fetchItems();
  }, [router]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/admin/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      } else {
        console.error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (response.ok) {
        setNewItem({ name: '', serialNumber: '', description: '' });
        fetchItems();
      } else {
        alert('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const response = await fetch(`/api/admin/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      if (response.ok) {
        setEditingItem(null);
        fetchItems();
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`/api/admin/items/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchItems();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>จัดการอุปกรณ์ - ระบบยืม-คืนอุปกรณ์</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">จัดการอุปกรณ์</h1>

      {/* Add New Item Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">เพิ่มอุปกรณ์ใหม่</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">ชื่ออุปกรณ์:</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="serialNumber" className="block text-gray-700 text-sm font-bold mb-2">หมายเลขซีเรียล:</label>
            <input
              type="text"
              id="serialNumber"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newItem.serialNumber}
              onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">คำอธิบาย:</label>
            <textarea
              id="description"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            ></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              เพิ่มอุปกรณ์
            </button>
          </div>
        </form>
      </div>

      {/* Item List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">รายการอุปกรณ์</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ชื่อ
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  หมายเลขซีเรียล
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  คำอธิบาย
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {editingItem?.id === item.id ? (
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {editingItem?.id === item.id ? (
                      <input
                        type="text"
                        value={editingItem.serialNumber}
                        onChange={(e) => setEditingItem({ ...editingItem, serialNumber: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      item.serialNumber
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {editingItem?.id === item.id ? (
                      <select
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="BORROWED">Borrowed</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    ) : (
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${item.status === 'AVAILABLE' ? 'text-green-900' : 'text-red-900'}`}>
                        <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${item.status === 'AVAILABLE' ? 'bg-green-200' : 'bg-red-200'}`}></span>
                        <span className="relative">{item.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {editingItem?.id === item.id ? (
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      item.description || '-'
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    {editingItem?.id === item.id ? (
                      <>
                        <button
                          onClick={handleUpdateItem}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ลบ
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}