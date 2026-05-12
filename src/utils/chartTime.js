/**
 * Adds evenly spaced live-style timestamps to chart data.
 *
 * The UAL sensor API timestamps can be irregular, so this utility creates
 * cleaner x-axis labels such as 12:36:06, 12:36:09, 12:36:12.
 */
export function addLiveDisplayTimes(data, chartEndTime, intervalMs) {
  return data.map((reading, index) => {
    const pointTime = new Date(
      chartEndTime.getTime() - (data.length - index - 1) * intervalMs
    );

    return {
      ...reading,
      liveDisplayTime: pointTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  });
}