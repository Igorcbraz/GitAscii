'use client'

import { ChevronDown } from 'lucide-react'
import React, { useMemo } from 'react'

import { GITHUB_CONTRIBUTION_COLORS, MONTH_NAMES } from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

function getDarkThemeContributionColor(count: number): string {
  if (count <= 0) return GITHUB_CONTRIBUTION_COLORS.LEVEL_0
  if (count <= 2) return GITHUB_CONTRIBUTION_COLORS.LEVEL_1
  if (count <= 5) return GITHUB_CONTRIBUTION_COLORS.LEVEL_2
  if (count <= 9) return GITHUB_CONTRIBUTION_COLORS.LEVEL_3
  return GITHUB_CONTRIBUTION_COLORS.LEVEL_4
}

export function GitHubContributionGraph() {
  const githubData = useEditorStore((state) => state.githubData)
  const { t } = useI18n()

  const weeksData = useMemo(() => {
    if (githubData?.contributions?.weeks && githubData.contributions.weeks.length > 0) {
      return githubData.contributions.weeks.map((week) => ({
        days: week.contributionDays.map((day) => ({
          count: day.contributionCount,
          date: day.date,
          color: getDarkThemeContributionColor(day.contributionCount),
        })),
        firstDate: week.contributionDays[0]?.date ? new Date(week.contributionDays[0].date) : null,
      }))
    }

    return Array.from({ length: 52 }).map((_, weekIdx) => {
      return {
        days: Array.from({ length: 7 }).map((_, dayIdx) => {
          const seed = (weekIdx * 7 + dayIdx) * 2654435761
          const hash = (seed >>> 0) % 100
          let count = 0
          if (hash > 85) count = 10
          else if (hash > 70) count = 6
          else if (hash > 50) count = 3
          else if (hash > 30) count = 1
          return {
            count,
            date: '',
            color: getDarkThemeContributionColor(count),
          }
        }),
        firstDate: null,
      }
    })
  }, [githubData?.contributions])

  const totalContributions =
    githubData?.contributions?.totalContributions ??
    weeksData.reduce(
      (sum, w) => sum + w.days.reduce((daySum, d) => daySum + (d.count > 0 ? d.count : 0), 0),
      0
    )

  return (
    <div className="mt-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-normal text-[#f0f6fc]">
          {t('github_mode.contributions.summary', '{count} contributions in the last year').replace(
            '{count}',
            totalContributions.toLocaleString()
          )}
        </h2>
        <div className="text-xs text-[#9198a1] flex items-center gap-1 cursor-default">
          <span>{t('github_mode.contributions.settings', 'Contribution settings')}</span>
          <ChevronDown size={12} />
        </div>
      </div>

      <div className="border border-[#30363d] rounded-md p-4 bg-[#0d1117] w-full overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[680px] w-full">
            <div className="flex text-[10px] text-[#9198a1] mb-1.5 pl-6 justify-between pr-2 select-none">
              {MONTH_NAMES.map((month) => (
                <span key={month}>{t(`common.month.${month.toLowerCase()}`, month)}</span>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-[9px] text-[#9198a1] py-0.5 select-none shrink-0 w-4">
                <span className="leading-[10px]">{t('github_mode.contributions.mon', 'Mon')}</span>
                <span className="leading-[10px]">{t('github_mode.contributions.wed', 'Wed')}</span>
                <span className="leading-[10px]">{t('github_mode.contributions.fri', 'Fri')}</span>
              </div>

              <div className="flex-1 grid grid-flow-col auto-cols-fr gap-[3px]">
                {weeksData.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-rows-7 gap-[3px]">
                    {week.days.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="aspect-square w-full rounded-[2px] border border-[rgba(255,255,255,0.03)] transition-transform hover:scale-125"
                        style={{ backgroundColor: day.color }}
                        title={
                          day.date
                            ? (day.count === 1
                                ? t(
                                    'github_mode.contributions.day_tooltip_one',
                                    '1 contribution on {date}'
                                  )
                                : t(
                                    'github_mode.contributions.day_tooltip_other',
                                    '{count} contributions on {date}'
                                  )
                              )
                                .replace('{count}', String(day.count))
                                .replace('{date}', day.date)
                            : (day.count === 1
                                ? t('github_mode.contributions.count_tooltip_one', '1 contribution')
                                : t(
                                    'github_mode.contributions.count_tooltip_other',
                                    '{count} contributions'
                                  )
                              ).replace('{count}', String(day.count))
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-[#9198a1] pt-2 select-none">
              <span className="text-[11px] text-[#4493f8] hover:underline cursor-default">
                {t('github_mode.contributions.learn_how', 'Learn how we count contributions')}
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span>{t('github_mode.contributions.less', 'Less')}</span>
                <div
                  className="w-[10px] h-[10px] rounded-[2px] border border-[rgba(255,255,255,0.05)]"
                  style={{ backgroundColor: GITHUB_CONTRIBUTION_COLORS.LEVEL_0 }}
                />
                <div
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: GITHUB_CONTRIBUTION_COLORS.LEVEL_1 }}
                />
                <div
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: GITHUB_CONTRIBUTION_COLORS.LEVEL_2 }}
                />
                <div
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: GITHUB_CONTRIBUTION_COLORS.LEVEL_3 }}
                />
                <div
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: GITHUB_CONTRIBUTION_COLORS.LEVEL_4 }}
                />
                <span>{t('github_mode.contributions.more', 'More')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
