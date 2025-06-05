import Link from "next/link";
import LogoutButton from "../LogoutButton";
type MenubarProps = {
  page: string;
};
export default function MenuBar(props: MenubarProps) {
  return (
    <div>
      <div className="p-4 bg-blue-400 text-5xl">
        <div className="flex flex-row">
          <div className="basis-3/3">
            <h1 className="">Sathon Tiger Borrow</h1>
          </div>
          <div className="basis-0/3">
            <LogoutButton className=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded " />
          </div>
        </div>
      </div>
      <div className="flex justify-start bg-blue-600 p-5 text-3xl text-white">
        <div className="ml-8">
          <Link href="/user" className="krub-regular ml-3">
            หน้าหลัก
          </Link>
          <Link href="/user/item" className="krub-regular ml-10">
            คลังอุปกรณ์
          </Link>
        </div>
      </div>
      <div className="p-5 bg-gray-300">
        <p className="flex justify-start text-2xl krub-regular text-center">
          ตอนนี้คุณอยู่หน้า {props.page}
        </p>
      </div>
    </div>
  );
}
