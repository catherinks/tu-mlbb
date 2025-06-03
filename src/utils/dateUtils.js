
//Форматирует строку с датой в удобочитаемый вид с временем MSK+2
export const formatNewsDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return "Дата не указана";
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error('Некорректная дата');
    }

    // Создаем дату с учетом смещения +2 часа от UTC
    const mskPlus2Date = new Date(date.getTime() + (2 * 60 * 60 * 1000));
    
    // Форматирование с учетом смещения
    return mskPlus2Date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });

  } catch (error) {
    console.error("Ошибка форматирования даты:", error);
    return "Дата не указана";
  }
};