import { useState } from 'react'
import * as Icon from '@/components/icons'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form-field'
import { fieldMessageId } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { SegmentedMeter } from '@/components/ui/progress'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  CURRENCY_OPTIONS,
  EMOJI_GROUP_OPTIONS,
  PERIOD_OPTIONS,
  type EmojiGroupOption,
  type PeriodOption,
} from '../helpers/DevUiHelpers'
import Section, { Row } from './Section'

const FormsSection = () => {
  const [period, setPeriod] = useState<PeriodOption>('week')
  const [group, setGroup] = useState<EmojiGroupOption>('all')
  const [keep, setKeep] = useState(true)

  return (
    <Section title="Forms" description="input · password-input · textarea · select · checkbox · label · form-field · segmented-tabs">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="dev-email" label="Email">
          <Input id="dev-email" type="email" placeholder="sam@email.com" />
        </FormField>
        <FormField
          id="dev-password"
          label="Password"
          labelAction={<span className="text-sm font-semibold text-primary">Forgot password?</span>}
        >
          <PasswordInput id="dev-password" placeholder="••••••••" />
        </FormField>
        <FormField id="dev-error" label="With error" error="Enter a valid email address">
          <Input id="dev-error" aria-invalid aria-describedby={fieldMessageId('dev-error')} defaultValue="sam@" />
        </FormField>
        <FormField id="dev-currency" label="Currency" hint="Used for every amount in the app.">
          <Select defaultValue="USD">
            <SelectTrigger id="dev-currency">
              <SelectValue placeholder="Choose currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="dev-pw-strength" label="Password strength (meter)">
          <PasswordInput id="dev-pw-strength" defaultValue="supersecret" />
          <SegmentedMeter filled={3} label="Password strength: strong" />
          <span className="text-xs font-semibold text-success">Strong password</span>
        </FormField>
        <FormField id="dev-note" label="Note" labelVariant="muted">
          <Textarea id="dev-note" placeholder="Lunch with Ana" />
        </FormField>
      </div>

      <Row label="Toolbar fields (variant filled, size md)">
        <div className="flex w-full flex-wrap gap-2.5 rounded-panel bg-bg p-3">
          <Input
            variant="filled"
            size="md"
            placeholder="Search notes"
            aria-label="Search notes"
            startIcon={<Icon.Search />}
            wrapperClassName="w-80"
          />
          <Select defaultValue="all">
            <SelectTrigger variant="filled" size="md" className="w-44" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="food">🍔 Food</SelectItem>
              <SelectItem value="groceries">🛒 Groceries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Row>

      <Row label="Checkbox">
        <div className="flex items-center gap-2.5">
          <Checkbox id="dev-keep" checked={keep} onCheckedChange={(v) => setKeep(v === true)} />
          <Label htmlFor="dev-keep" className="font-normal">
            Keep me logged in
          </Label>
        </div>
        <Checkbox aria-label="Unchecked" />
        <Checkbox aria-label="Disabled" disabled />
      </Row>

      <Row label="SegmentedTabs · track (desktop period tabs)">
        <SegmentedTabs variant="track" value={period} onValueChange={setPeriod} options={PERIOD_OPTIONS} aria-label="Period" />
      </Row>
      <Row label="SegmentedTabs · pill (mobile period tabs, toolbar)">
        <div className="w-full max-w-sm">
          <SegmentedTabs variant="pill" fullWidth value={period} onValueChange={setPeriod} options={PERIOD_OPTIONS} aria-label="Period" />
        </div>
        <SegmentedTabs variant="pill" size="sm" value={period} onValueChange={setPeriod} options={PERIOD_OPTIONS.slice(1, 4)} aria-label="Period" />
      </Row>
      <Row label="SegmentedTabs · chips (emoji groups)">
        <div className="rounded-fab bg-bg p-2.5">
          <SegmentedTabs variant="chips" value={group} onValueChange={setGroup} options={EMOJI_GROUP_OPTIONS} aria-label="Emoji group" />
        </div>
      </Row>
    </Section>
  )
}

export default FormsSection
