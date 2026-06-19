import React, { useId, useState, useEffect, useRef } from 'react'
import './Select.css'
import { IconPlus } from './Icons'

/* Ce composant affiche un select moderne sous forme de combobox de recherche dynamique.
   Il est rétrocompatible avec les selects standards et supporte la recherche côté serveur (loadOptions). */
const Select = ({
  id,
  label,
  options = [],
  value,
  onChange,
  icon,
  withAdd = false,
  onAdd,
  placeholder = 'Rechercher ou sélectionner...',
  loadOptions, // Fonction optionnelle de chargement dynamique depuis le backend
  ...selectProps
}) => {
  const generatedId = useId()
  const selectId = id || generatedId

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Récupère le libellé de l'option actuellement sélectionnée
  const getSelectedLabel = () => {
    const selected = options.find((opt) => String(opt.value) === String(value))
    return selected ? selected.label : ''
  }

  // Synchronise le terme de recherche avec l'option sélectionnée à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(getSelectedLabel())
    }
  }, [value, options, isOpen])

  // Recherche distante (quand loadOptions est fourni)
  useEffect(() => {
    if (!isOpen || !loadOptions) return

    setIsLoading(true)
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await loadOptions(searchTerm)
        // Formatage homogène pour l'affichage
        const formatted = results.map(opt => ({
          value: opt.value ?? opt.id ?? opt.id_personne ?? opt.id_agence ?? opt.id_utilisateur,
          label: opt.label ?? opt.nom_complet ?? opt.nom_agence ?? opt.nom_affichage ?? opt.nom,
        }))
        setFilteredOptions(formatted)
        setHighlightedIndex(-1)
      } catch (error) {
        console.error('Error loading options from backend:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, isOpen, loadOptions])

  // Filtrage local (quand loadOptions n'est pas fourni)
  useEffect(() => {
    if (!isOpen || loadOptions) return

    const filtered = options.filter((opt) =>
      String(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOptions(filtered)
    setHighlightedIndex(-1)
  }, [searchTerm, options, isOpen, loadOptions])

  // Fermeture en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    if (onChange) {
      onChange({
        target: {
          value: option.value,
          id: selectId,
          name: selectProps.name || '',
        },
      })
    }
    setSearchTerm(option.label)
    setIsOpen(false)
  }

  // Gestion de la navigation clavier
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        e.preventDefault()
        break
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex])
        } else if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0])
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        e.preventDefault()
        break
      default:
        break
    }
  }

  return (
    <div className="select-container" ref={containerRef}>
      {label && (
        <label className="select-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="select-row">
        <div className="select-wrapper">
          {icon && <span className="select-icon">{icon}</span>}
          
          <input
            id={selectId}
            ref={inputRef}
            type="text"
            className="select-field select-input-search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!isOpen) setIsOpen(true)
            }}
            onFocus={() => {
              setIsOpen(true)
              setSearchTerm('') // Vide le champ au focus pour faciliter la saisie
            }}
            onKeyDown={handleKeyDown}
            placeholder={getSelectedLabel() || placeholder}
            autoComplete="off"
            {...selectProps}
          />
          
          <span 
            className={`select-arrow-indicator ${isOpen ? 'open' : ''}`}
            onClick={() => {
              setIsOpen(!isOpen)
              if (!isOpen) inputRef.current?.focus()
            }}
            aria-hidden="true"
          />
        </div>

        {withAdd && (
          <button 
            className="select-add-btn" 
            onClick={onAdd} 
            type="button" 
            aria-label="Ajouter une option"
          >
            <IconPlus size={20} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="select-dropdown-menu">
          {isLoading ? (
            <div className="select-dropdown-status">
              <span className="spinner-dot" />
              <span>Chargement...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="select-dropdown-status select-no-results">
              Aucun résultat trouvé
            </div>
          ) : (
            <ul className="select-dropdown-list" role="listbox" id={`${selectId}-list`}>
              {filteredOptions.map((option, idx) => (
                <li
                  key={option.value || idx}
                  className={`select-dropdown-item ${
                    String(option.value) === String(value) ? 'selected' : ''
                  } ${idx === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={String(option.value) === String(value)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default Select
