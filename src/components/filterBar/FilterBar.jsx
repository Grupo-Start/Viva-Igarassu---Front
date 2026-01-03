import "./FilterBar.css";
import { Button } from "../button/Button";

export function FilterBar({ filters, onChange, onFilter }) {
  return (
    <div className="filter-bar">
      {/* Campo de busca centralizado */}
      <div className="search-container">
        <input
          type="text"
          name="pesquisa"
          placeholder="Buscar eventos"
          value={filters?.pesquisa || ""}
          onChange={onChange}
          className="search-input"
        />
      </div>

      {/* Filtros alinhados com botão ao lado */}
      <div className="filters-container">
        <select name="tipo" value={filters?.tipo} onChange={onChange}>
          <option value="">Tipo</option>
          <option value="Show">Show</option>
          <option value="Carnaval">Carnaval</option>
          <option value="São João">São João</option>
        </select>

        <select name="categoria" value={filters?.categoria} onChange={onChange}>
          <option value="">Categoria</option>
          <option value="Cultural">Cultural</option>
          <option value="Musical">Musical</option>
          <option value="Tradicional">Tradicional</option>
        </select>

        <input type="date" name="dataInicial" value={filters?.dataInicial} onChange={onChange} />
        <input type="date" name="dataFinal" value={filters?.dataFinal} onChange={onChange} />

        <Button onClick={onFilter} text="Filtrar" className="filter-button" />
      </div>
    </div>
  );
}

export default FilterBar;