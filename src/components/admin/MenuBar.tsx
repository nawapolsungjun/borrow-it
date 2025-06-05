import Link from "next/link";
import LogoutButton from "../LogoutButton";

type MenubarProps = {
  page: string;
};

export default function MenuBar(props: MenubarProps) {
  return (
    <div>
      <div className="p-4 bg-gray-400 text-5xl">
        <div className="flex flex-row">
          <div className="basis-3/3">
            <h1 className="tagesschrift-regular">
              Sathon Tiger Borrow (Admin)
            </h1>
          </div>
          <div className="basis-0/3">
            <LogoutButton className=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded " />
          </div>
        </div>
      </div>
      <div className="flex justify-start bg-gray-600 p-5 text-3xl text-white">
        <div className="ml-8">
          <Link href="/admin" className="krub-regular ml-3">
            หน้าหลัก
          </Link>
          <Link href="/admin/item" className="krub-regular ml-10">
            จัดการอุปกรณ์
          </Link>
          <Link href="/admin/borrow" className="krub-regular ml-10">
            ประวัติการยืม
          </Link>
        </div>
      </div>
      <div className="p-5 bg-gray-300">
        <p className="flex justify-start text-2xl font-title krub-regular text-center">
          {" "}
          ตอนนี้คุณอยู่หน้า {props.page}{" "}
        </p>
      </div>
    </div>
  );
}
