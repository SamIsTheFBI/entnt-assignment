import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between item-center">
      <div className="px-2 font-bold">
        <Link to="/">TalentFlow</Link>
      </div>
    </header>
  )
}
