export const Repl = {
  name: 'NoRepl',
  setup() {
    return () => null
  }
}

export function useStore() {
  return {
    setFiles() {}
  }
}

export function useVueImportMap() {
  return {
    vueVersion: undefined,
    importMap: undefined
  }
}

export default Repl
