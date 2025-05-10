import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '14.28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'center',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  timeSlot: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const TimetablePDF = ({ timetable, batchName }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];

  const getEntryForSlot = (day, timeSlot) => {
    return timetable.find(
      entry => entry.day === day && entry.timeSlot === timeSlot
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Timetable</Text>
        <Text style={styles.subheader}>{batchName}</Text>
        
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.headerCell]}>
              <Text style={styles.tableCell}>Time/Day</Text>
            </View>
            {days.map(day => (
              <View key={day} style={[styles.tableCol, styles.headerCell]}>
                <Text style={styles.tableCell}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time Slots */}
          {timeSlots.map(timeSlot => (
            <View key={timeSlot} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={[styles.tableCell, styles.timeSlot]}>{timeSlot}</Text>
              </View>
              {days.map(day => {
                const entry = getEntryForSlot(day, timeSlot);
                return (
                  <View key={`${day}-${timeSlot}`} style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {entry ? (
                        <>
                          {entry.module?.module_name || 'Unknown Module'}{'\n'}
                          {entry.lecturer || 'Unknown Lecturer'}{'\n'}
                          {entry.hall?.hall_name || 'Unknown Hall'}
                        </>
                      ) : (
                        '-'
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default TimetablePDF; 