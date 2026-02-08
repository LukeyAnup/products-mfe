import { FaMagnifyingGlass } from "react-icons/fa6";
import { usePriceFilterStore } from "../store";
import ButtonIcon from "./reusable/buttonIcon";
import InputComponent from "./reusable/input";

export default function SearchBar() {
  const { query, setQuery } = usePriceFilterStore();

  return (
    <div className="w-full mx-auto relative px-6">
      <InputComponent
        fullWidth
        name="search"
        value={query}
        data-testid="search"
        placeholder="Search products..."
        onChange={(e) => setQuery(e.target.value)}
        sx={{}}
      />

      <ButtonIcon
        sx={{
          position: "absolute",
          right: 28,
          top: 3,
        }}
      >
        <FaMagnifyingGlass className="h-5 w-5" />
      </ButtonIcon>
    </div>
  );
}
