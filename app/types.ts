export type Params = {
  date?: string
  tag?: string
  q?: string
}

export type HomeProps = {
  searchParams: Promise<Params>
}
