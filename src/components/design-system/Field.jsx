import { ChevronDown, Search } from 'lucide-react'
import { cn } from '../../util/cn'

// Ported from Design/drinkedin-v0/components/drinkedin/field.tsx, stripped
// of TypeScript. ai/v1-redesign-plan.md PR2 — inert until a later PR
// imports these. Plain native-element wrappers (no form-library binding),
// so react-hook-form's register() spreads onto these exactly like it does
// onto today's raw <input>/<textarea>/<select>.
const controlBase =
	'w-full rounded-control border border-input bg-card px-3.5 text-base text-foreground placeholder:text-muted-foreground transition-colors hover:border-border-strong focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive'

function FieldShell({ id, label, hint, error, hideLabel, children }) {
	const hintId = hint ? `${id}-hint` : undefined
	const errorId = error ? `${id}-error` : undefined
	const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className={cn('text-sm font-medium text-foreground', hideLabel && 'sr-only')}>
				{label}
			</label>
			{children(describedBy)}
			{hint && !error && (
				<p id={hintId} className="text-sm text-muted-foreground">
					{hint}
				</p>
			)}
			{error && (
				<p id={errorId} className="text-sm font-medium text-destructive">
					{error}
				</p>
			)}
		</div>
	)
}

export function Input({ id, label, hint, error, hideLabel, className, ...props }) {
	return (
		<FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
			{(describedBy) => (
				<input
					id={id}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy}
					className={cn(controlBase, 'h-11', className)}
					{...props}
				/>
			)}
		</FieldShell>
	)
}

export function Textarea({ id, label, hint, error, hideLabel, className, rows = 4, ...props }) {
	return (
		<FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
			{(describedBy) => (
				<textarea
					id={id}
					rows={rows}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy}
					className={cn(controlBase, 'min-h-24 resize-y py-2.5 leading-relaxed', className)}
					{...props}
				/>
			)}
		</FieldShell>
	)
}

export function Select({ id, label, hint, error, hideLabel, options, className, ...props }) {
	return (
		<FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
			{(describedBy) => (
				<div className="relative">
					<select
						id={id}
						aria-invalid={error ? true : undefined}
						aria-describedby={describedBy}
						className={cn(controlBase, 'h-11 appearance-none pr-10', className)}
						{...props}
					>
						{options.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
					<ChevronDown
						className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden="true"
					/>
				</div>
			)}
		</FieldShell>
	)
}

export function SearchInput({
	id,
	label,
	size = 'md',
	submitLabel,
	action,
	className,
	name = 'q',
	...props
}) {
	const isLarge = size === 'lg'

	const field = (
		<div
			className={cn(
				'group flex w-full items-center gap-2 rounded-control border bg-card transition-colors focus-within:border-foreground focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring',
				isLarge ? 'h-16 border-border-strong pl-5 pr-2' : 'h-11 border-input pl-3.5 pr-1.5',
				className
			)}
		>
			<Search className={cn('shrink-0 text-muted-foreground', isLarge ? 'size-5' : 'size-4')} aria-hidden="true" />
			<label htmlFor={id} className="sr-only">
				{label}
			</label>
			<input
				id={id}
				type="search"
				name={name}
				autoComplete="off"
				className={cn(
					'h-full min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:outline-none',
					isLarge ? 'text-lg' : 'text-base'
				)}
				{...props}
			/>
			{submitLabel && (
				<button
					type="submit"
					className={cn(
						'shrink-0 rounded-[max(0px,calc(var(--control-radius)-1px))] bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/85 active:bg-primary/75',
						isLarge ? 'h-12 px-5 text-[0.9375rem]' : 'h-8 px-3 text-sm'
					)}
				>
					{submitLabel}
				</button>
			)}
		</div>
	)

	if (!action) return field

	return (
		<form role="search" action={action} method="get" className="w-full">
			{field}
		</form>
	)
}
